var SpotifyWebApi = require('spotify-web-api-node'); // Express web server framework

var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');
let sql = require("mssql")
var _ = require('lodash')

var db_api = require('./db_api.js');
var app = require('./app')
var resolver = require('./resolver.js');

//========================================
//db setup

const {poolPromise} = require('./db.js');
poolPromise.then(function (newPool) {
	module.exports.poolGlobal = newPool;
	var sreq = new sql.Request(newPool);
	sreq.query("select getdate();")
		.then(function (res) {
			console.log("sql test:", res);
		})
});

//========================================
//spotify api setup
//https://developer.spotify.com/documentation/general/guides/authorization-guide/

let all_scopes = ["playlist-read-private", "playlist-modify-private", "playlist-modify-public", "playlist-read-collaborative", "user-modify-playback-state", "user-read-currently-playing", "user-read-playback-state", "user-top-read", "user-read-recently-played", "app-remote-control", "streaming", "user-read-birthdate", "user-read-email", "user-read-private", "user-follow-read", "user-follow-modify", "user-library-modify", "user-library-read"];

//var clientSecret = 'a00084c5c193478e9fc5d9a0c0e70058';
//var clientId = '0e7ef13646c9410293a0119e652b35f7',

var scopes = all_scopes,
	redirectUri = 'http://localhost:8888/callback',
	//todo:
	state = 'some-state-of-my-choice';

var client_id = '178a441343904c588cef9acf8165a5d4'; // Your client id
var client_secret = '1c09323e0aad42cfaef5f23bb08b6428'; // Your secret

var spotifyApi = {};




//var global_refresh_franky = "AQDn9X-9Jq2e-gbcZgf-U4eEzJadw2R6cFlXu1zKY-kxo3CEY4FaLtwL8tw7YcO8QPd2h3OXcSTvOQwKG5kmpOz2Nm6MTrHfM0r4UGQ7A7Aa-z8tywMvbgVyWmgLcEXDlVw";
//var global_refresh_dan = "AQDRaPbAH9oSHZ3xKHxbxHZtsJrvry2gr6x-swN4uddSuc_InwPNaaJG7l9ZCKIRzDzUEAGk6tSD4GCyks79J0vcICT1l6yvKDZym3nqQzrG860UPUCu_lMFKzZPZVuc9wc"

var global_refresh = "AQDn9X-9Jq2e-gbcZgf-U4eEzJadw2R6cFlXu1zKY-kxo3CEY4FaLtwL8tw7YcO8QPd2h3OXcSTvOQwKG5kmpOz2Nm6MTrHfM0r4UGQ7A7Aa-z8tywMvbgVyWmgLcEXDlVw";

// var global_access_token = "";
var refresh =  function(){
	return new Promise(function(done, fail) {
		console.log("refresing...");
		var authOptions = {
			method:"POST",
			url: 'https://accounts.spotify.com/api/token',
			headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
			form: {
				grant_type: 'refresh_token',
				refresh_token: global_refresh
			},
			json: true
		};

		rp(authOptions).then(function (res) {
			module.exports.token = res.access_token;
			console.log("new global_access_token from refresh",module.exports.token);
			done();
		}).catch(function (err) {
			console.log(err.error);
			fail(err);
		})
	})
}

var doUserAuth = function(){
	var credentials = {
		clientId: client_id,
		clientSecret: client_secret,
		// redirectUri:"cheat"
		redirectUri
	};
	spotifyApi = new SpotifyWebApi(credentials);
	refresh().then(sideaf =>{
		spotifyApi.setAccessToken(module.exports.token);
	});
};
//testing:
doUserAuth()

//========================================
//Client Credential flow


var doAuth = function () {

	var credentials = {
		clientId: clientId,
		clientSecret: clientSecret,
	};

	spotifyApi = new SpotifyWebApi(credentials);

	// Retrieve an access token.
	spotifyApi.clientCredentialsGrant().then(
		function (data) {
			console.log('The access token expires in ' + data.body['expires_in']);
			console.log('The access token is ' + data.body['access_token']);

			// Save the access token so that it's used in future calls
			spotifyApi.setAccessToken(data.body['access_token']);
			module.exports.token = data.body['access_token']
		},
		function (err) {
			console.log('Something went wrong when retrieving an access token', err);
		}
	);

// var token = "BQBWcWz_OUyjmnUyNt0iObiJRz7xxvjkdGRoGKizOyEiolvCcLVv1QU7d3iIeR6u0-QYtJaVOErUKOD9GD13NJTVss-TQ7F_o27xt0xENFCgBdSkmcKyzTvAxDWmrZvUox77oaC-yQL03aBV_-rOEifo5FvFzD3p9eUZzicbZUhVqkHUN3-p4CrTqAbs6oJO-v9hUCjseEc-3B1ZfkCm-VXUh43Ic1L9etZfU3tzg2wrlFyzC_oBbrRJ7Y1lQVrqYC_7rqpfb4neL3nlK4hz1oSctCg"
// spotifyApi.setAccessToken(token);
// module.exports.token = token;

}

//testing:
//doAuth()

// setInterval( e=>{
// 	console.log("client refresh @ 60m interval");
// 	doAuth()
// },3600*1000)

//=================================================
//methods
var me = module.exports;

//the node api i'm using, although very limited and unfinished it seems like its the best out there...
//https://github.com/thelinmichael/spotify-web-api-node

//thought about using 'bind' to pass the initial func and call it here
//but works a little differently with spotifyApi which I can't control insides of
//this.getAccessToken is not a function

//instead ended up with this pageIt wrapper which didn't go exactly as planned
//because of some response format weirdness but its still nice :)
//getFollowedArtists is example of weirdness, and its the reason I must pass a key

/**pageIt
 *
 * @param key Is now the singular known (artist NOT artists)
 * */
var pageIt =  function(key,data){
	return new Promise(function(done, fail) {
		if(!(data)){data=key;key=null;}
		if(data.body.next){
			console.log("pageIt",data.body.next);
			//console.log("key",key);
			resolver.getPages(data.body,key)
				.then(pages =>{
					// console.log("$",pages[0][key + "s"].items.length);
					// console.log("$",pages[1][key + "s"].items.length);
					pages.forEach(p =>{
						if(key){
							data.body.items = data.body.items.concat(p[key + "s"].items)
						}else{
							data.body.items = data.body.items.concat(p.items)
						}
					})
					data.body.pagedTotal = data.body.items.length;
					done(data.body)
				})
				.catch(e => console.error(e))
		}else{done(data.body)}
	})
}

//todo: something off with my 'totals'
var pageItAfter =  function(key,pages,data){
	return new Promise(function(done, fail) {
		//what does this binding thing mean again?
		if(!(data)){data=key;key=null;}
		if(data.body.next){
			//console.log("pageItAfter",data.body.next);

			//console.log("key",key);
			resolver.getPage(data.body,key)
				.then(r =>{
					pages.push(r)
					if(r.artists.next){
						pageItAfter('',pages,{body:{next:r.artists.next}}).then(done).catch(fail)
					}
					else{
						//get the original result
						var body = {items:data.body.artists.items}
						pages.forEach(p =>{
							body.items =  body.items.concat(p.artists.items)
						})
						done(body);
					}
				})
				.catch(e => console.error(e))
		}else{done(data.body)}
	})
}
/** Qualifying Report Object (QRP)
 *
 {
	artists: the original payload
	payload: the created payload for external resolution
	db: entries resolved by the db
	lastLook: <TODO> attempted to resolve on db but couldn't + had history of checking so we'll skip this
	resolved: final result for user
}
 * */



//todo: hardcoded user name
//todo: custom call (weird 50 limit)
//todo: paging
me.getUserPlaylists = function (req,res) {

	//todo: limit's max = 50 but cut it here for speedier testing
	//dacandyman01
	spotifyApi.getUserPlaylists('123028477', {limit: 50})
		.then(pageIt.bind(null,null))
		.then(function (r) {
			//console.log('Retrieved playlists', data.body);
			var t = _.uniqBy(r.items, function(n) {return n.id;});
			console.log(t.length);
			//res.send(t);
			res.send(r);
		}, function (err) {
			console.error('getUserPlaylists failed', err);
		});
}

//todo: remove self from users, collabUsers

me.getUserPlaylistFriends = function (req,res) {

	//var user = 'tipshishat';
	var user = 'dacandyman01';
	spotifyApi.getUserPlaylists(user, {limit: 50})
		.then(pageIt.bind(null,null))
		.then(function (body) {

			var users = [];
			var collabUsers = [];

			//todo: still don't quite understand something here
			//apparently having the g flag here was causing me to miss Kim somehow unless I exec on her
			//id before checking it again... idk confusing AF

			//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
			///JavaScript RegExp objects are stateful when they have the global or sticky flags set (e.g. /foo/g or /foo/y).
			// They store a lastIndex from the previous match...

			//var numericId = /^[0-9]*$/g;
			var numericId = /^[0-9]*$/;
			body.items.forEach(p =>{
				//was exploring different ways of pushing only unique objects by a specific value
				//decided just to uniq them later

				//users = _.union(users, [p]);
				//users.indexOf(p.owner) === -1 ? users.push(p.owner):{};
				//!users[p.owner.id] ? users[p.owner.id] = p : [];

				users.push(p.owner);

				//todo: weird shit with Kim
				//for some reason I thought I needed to go resolve these profiles, not true so can ignore i guess...

				//p.owner.id == '1217637895' ? console.log(numericId.exec('1217637895')):{};
			    //p.owner.id == '1240498738' ? console.log(numericId.exec('1240498738')):{};

				p.id === '7pH9FCTIUwEEc2NkCBjeJ6' ? console.log(p):{};

				p.collaborative ? collabUsers.push(p.owner):{}
			});

			users = _.uniqBy(users, function(n) {return n.id;});
			collabUsers = _.uniqBy(collabUsers, function(n) {return n.id;});

			console.log("users",users.length);
			console.log("collabUsers",collabUsers.length);

			//body.items is just every playlist from the user I think
			// res.send(body.items);
			res.send({users:users,collabUsers:collabUsers});

		}, function (err) {
			console.error('getUserPlaylists failed', err);
		});
}



me.getFollowedArtists =  function(req,res,next){
	this.name = "getFollowedArtists";
	//fully qualified artist objects include genres
	//todo: not sure on limit of this yet
	//https://developer.spotify.com/documentation/web-api/reference/follow/get-followed/

	var pages = [];
	spotifyApi.getFollowedArtists({limit:50})
		.then(function(data) {
			//some results from spotify that are asking for specific types of items
			//have a different response format with +1 levels named after that type
			//got into this situation after trying to reuse my promise functions related to paging
			data.body.items = data.body.artists.items;
			data.body.next = data.body.artists.next;
			data.body.total = data.body.artists.total;
			return data;

			//bind: first value is what 'this' gets set to in function being bound to
			//the rest are just other arguments which will PRECEDE the normal return value
			//for the bound function in the function's param list
			//hence it pageit doesn't not use this, has a key value and then takes the data
			//passed via promise chaining as its last arg

		})
		 .then(pageItAfter.bind(null,'artist',pages))
		// .then(r =>{
		//
		// 	var artists = r.items;
		// 	// console.log(artists.length);
		//
		// 	return resolver.resolveArtists(artists)
		// 		.then(resolved =>{
		// 			var artistsPay = [];
		// 			//prune duplicate artists from track aggregation
		// 			artistsPay = _.uniqBy(artistsPay, function(n) {return n.id;});
		//
		// 			return db_api.commitArtistGenres(artistsPay)
		// 				.then(justGetFromDb =>{
		// 					return db_api.checkDBForArtistGenres({artists:artistsPay},'artists')
		// 						.then(result =>{
		// 							if(result.db.length !== result.artists.length){
		// 								console.log("couldn't find " + result.payload.length + " artists");
		// 							}
		// 							result.resolved = result.db.concat(result.payload)
		// 							return result
		// 							//return 'test'
		// 						})
		// 				})
		// 		})
		// })
		.then(r =>{
			//console.log(r.items.length + " " + r.artists.items.length);
			// console.log(this.name + " :" + r.length);
			//res.send(r.artists.items);
			//testing:

			res.send(r);

		})
		.catch(err =>{
			console.log(err);
			res.status(500).send(this.name + " :" + err)
			//next(e.body)
		})
}


//todo: regarding getMySavedTracks and getMySavedAlbums
//#1 interestingly...
//when I pass artistsPay to commit + checkDB, because of how I setup the albumOb.body.items,
//I'm actually passing a reference to this original albumOb to be checked
//so albumOb.items come back fully qualified b/c they were qualified in place by reference

//todo: regarding getMySavedAlbums,getTopArtists, getMySavedTracks
//not doing anything with 'couldn't find artists' printout

/** getMySavedTracks
 * @desc Get tracks in the signed in user's Your Music library
 * @param req
 * @param res
 */
me.getMySavedTracks =  function(req,res){
	var trackOb = {};
	spotifyApi.getMySavedTracks({limit : 50})
		//testing:
		//.then(trackOb=>{console.log("TESTING WITH LIMITED # OF TRACKS");return trackOb;})
		.then(pageIt.bind(null))
		.then(pagedRes =>{
			trackOb = pagedRes;
			var artists = [];
			trackOb.items.forEach(item =>{
				artists = artists.concat(_.get(item,'track.artists'));
			})

			//prune duplicate artists from track aggregation
			artists = _.uniqBy(artists, function(n) {return n.id;});

			//resolving all the artists for all the tracks
			return resolver.resolveArtists(artists)
				.then(resolved =>{
					var artistsPay = [];

					trackOb.items.forEach(item =>{
						//note: theres an artist listing on both: items[0].track.album.artists AND a items[0].track.artists
						//the difference between the album's artist(s) and a track's artist(s)
						//well remove the album one for now
						delete item.track.album.artists;

						//I just don't like looking at these
						item.track.available_markets = null;
						item.track.album.available_markets = null;

						var findMatch = function(ar,id){
							var ret = false;
							ar.forEach(a =>{a.id === id ? ret = true:{};})
							return ret;
						};

						var resolvedTrackArtists = resolved.filter(a =>{return findMatch(item.track.artists,a.id)})
						item.track.artists = resolvedTrackArtists;

						//note: that I'm pushing references to this original trackOb here
						//when they get manipulated in promises after this, it'll show up in here
						//resolved have genres on them, still a bit of a waste of data to make a new array tho
						artistsPay = artistsPay.concat(item.track.artists)
					});

					//todo: here starting to question why I make these commits never return anything
					//and instead went with this convention in resolvePlaylists of commitPlayobs then checkDBForArtistGenres
					//I guess b/c it was just too involved to put together the object I want after having to take all these steps
					//in order to commit genres and artists and get back artists with fully qualified genres?
					//for now just keeping that convention I guess...

					//but now that I'm accidentally passing references down the line, maybe this wasn't such a bad idea
					//lot of data but very clean output for me to analyze

					//prune duplicate artists from track aggregation
					artistsPay = _.uniqBy(artistsPay, function(n) {return n.id;});

					return db_api.commitArtistGenres(artistsPay)
						.then(justGetFromDb =>{
							return db_api.checkDBForArtistGenres({artists:artistsPay},'artists')
								.then(result =>{
									if(result.db.length !== result.artists.length){
										console.log("couldn't find " + result.payload.length + " artists");
									}
									result.resolved = result.db.concat(result.payload)
									return result
									//return 'test'
								})
						})
				})
		})
		.then(r =>{
			//todo: interesting ^^^
			//res.send(trackOb.items);
			res.send(r.resolved);
		}, function(err) {
			console.log('getMySavedTracks failed', err);
		});
};


/** getMySavedAlbums
 *
 * @param req
 * @param res
 */
me.getMySavedAlbums =  function(req,res){
	var albumOb = {};
	spotifyApi.getMySavedAlbums({limit : 50})
		//testing:
		//.then(albumOb=>{console.log("TESTING WITH LIMITED # OF ALBUMS");return albumOb;})
		.then(pageIt.bind(null))
		.then(pagedRes =>{
			// //testing:
			// res.send(pagedRes)
			albumOb = pagedRes;
			var artists = [];
			albumOb.items.forEach(item =>{
				artists = artists.concat(_.get(item,'album.artists'));
			})
			//prune duplicate artists from track aggregation
			artists = _.uniqBy(artists, function(n) {return n.id;});

			return resolver.resolveArtists(artists)
				.then(resolved =>{
					var artistsPay = [];

					albumOb.items.forEach(item =>{
						//note: theres a genres listing on both: items[0].album.genres AND a items[0].album.artists.genres
						//(the one I'm finding myself) versus the genres of an album itself
						//removing the latter for now
						delete item.album.genres;

						//I just don't like looking at this
						item.album.available_markets = null;

						var findMatch = function(ar,id){
							var ret = false;
							ar.forEach(a =>{a.id === id ? ret = true:{};})
							return ret;
						};

						var resolvedAlbumArtists = resolved.filter(a =>{return findMatch(item.album.artists,a.id)})
						item.album.artists = resolvedAlbumArtists;

						//these have genres on them, still a bit of a waste tho
						artistsPay = artistsPay.concat(item.album.artists);
					});

					//prune duplicate artists from track aggregation
					artistsPay = _.uniqBy(artistsPay, function(n) {return n.id;});

					return db_api.commitArtistGenres(artistsPay)
						.then(justGetFromDb =>{
							return db_api.checkDBForArtistGenres({artists:artistsPay},'artists')
								.then(result =>{
									if(result.db.length !== result.artists.length){
										console.log("couldn't find " + result.payload.length + " artists");
									}
									result.resolved = result.db.concat(result.payload)
									return result
									//return 'test'
								})
						})
					//return albumOb;
				})
		})
		.then(r =>{
			//todo: interesting ^^^
			// res.send(albumOb.items);
			res.send(r.resolved);
		}, function(err) {
			// console.error('getMySavedAlbums: ', err);
			console.error(err);
			res.status(500).send("getMySavedAlbums: " + err)
		});
};


//todo: parameterize req for range
//todo: (name for this data type where u select stuff from predefined strings?)
/**
 * getTopArtists
 *
 * @param req.range = one of:
 *
 * long_term (calculated from several years of data and including all new data as it becomes available)
	medium_term (approximately last 6 months)
	short_term (approximately last 4 weeks)

 https://developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/

 */
me.getTopArtists = function(req,res){
	var range = "long_term";
	let uri = "https://api.spotify.com/v1/me/top/artists?limit=50&offset=0&time_range=" + range;
	let options = {uri:uri, headers: {"Authorization":'Bearer ' + module.exports.token}, json: true};
	//this comes with genres just not MY qualified ones
	//so usual process of committing in order to get qualified genres back
	rp(options).then(r => {
		db_api.commitArtistGenres(r.items)
			.then(justGetFromDb =>{
				db_api.checkDBForArtistGenres({artists:r.items},'artists')
					.then(result =>{
						if(result.db.length !== result.artists.length){
							console.log("couldn't find " + result.payload.length + " artists");
						}
						result.resolved = result.db.concat(result.payload);
						res.send(result.resolved)
					})
			},err =>{res.status(500).send(err)})
	},err =>{res.status(500).send(err)})

};


//WIP----------------------------------------------------------

//todo: move artist to req.artist
// don't think we're actually using this yet
me.searchArtist = function (req,res,next) {
	var artist = {name:"Queen"};
	//console.log(query);
	spotifyApi.searchArtists(artist.name)
		.then(function (r) {
			// done({artist: artist, result: r})
			res.send(r);
		}, function (err) {
			console.error(err);
			next(err)
		});
};

var getUserProfile =  function(u){
	return new Promise(function(done, fail) {
		//	https://api.spotify.com/v1/users/{user_id}
		let uri = "https://api.spotify.com/v1/users/"+ u.id;
		let options = {uri:uri, headers: {"Authorization":'Bearer ' + module.exports.token}, json: true};
		rp(options)
			.then(function (r) {
				done(r);
			}, function (err) {
				console.error('getUserProfile failed', err);
			});
	})
}


//=================================================
//resolving methods

// var artistResolve =  function(){
//     return new Promise(function(done, fail) {
//     done({done:"done"})
//     })
// }
//
// var artistResolve2 =  function(){
// 	return new Promise(function(done, fail) {
// 		done({done:"done2"})
// 	})
// }

//this is expecting a playob object defined as: {playlist:{},tracks:[],artists:[]}
//we are going to get the genres for every artist
//we're going to check the db first to see if we stored any genre info about an artist
//before asking spotify for genres on an artist

var resolveReturnArtists = function (playob) {
	return new Promise(function (done, fail) {
		console.log("getArtists:", playob.artists.length);
		db_api.checkDBForArtistGenres(playob,'artists')
			.then(
				r => {
					done(r);
				},
				e => {
					console.error(e);
					fail(e);
				})
	})
};

//this is a request from the UI after selecting playlists
//to have analyzed
me.resolvePlaylists = function(req,res){
	let startDate = new Date();
	console.log("resolvePlaylists start time:", startDate);
	console.log(req.body);
	//todo: requests from UI => just the playlists key is stringified - why?

	req.body.playlists = JSON.parse(req.body.playlists);
	console.log("req.body.playlists", req.body.playlists);

	//resolver.resolvePlaylists(req.body.playlists)
	//testing: fake UI request by just getting my own
	//todo: the node library is currently limited to 20 (no paging?)

	// module.exports.getUserPlaylists().then(r => {
	// 	var plays = [];
	// 	r.items.forEach(function (i) {
	// 		plays.push(i)
	// 	})
	// 	req.body.playlists = plays;
	//
	//
	// 	//testing: just 2 of them
	// 	//console.warn("only testing with 2 playlist");
	// 	//var playsr = [];
	// 	//playsr.push(plays[0]);
	// 	//playsr.push(plays[1]);
	// 	//req.body.playlists = playsr;
	//
	// }).then(q => {
	resolver.resolvePlaylists(req.body.playlists)
		.then(playobs => {

			//unwind artists from tracks and attach them to each playob
			playobs.forEach(function (playob) {
				playob.map = {};
				playob.artists = [];
				playob.tracks.forEach(t => {
					t.track.artists.forEach(a => {
						playob.map[a.id] = a;
					})
				})
				for (var key in playob.map) {
					playob.artists.push(playob.map[key])
				}
			});

			//now every playob looks like: {playlist:{},tracks:[],artists:[]}
			//console.log(app.jstr(playobs));

			var promises = [];
			playobs.forEach(function (playob) {
				promises.push(resolveReturnArtists(playob))
			})

			Promise.all(promises).then(playobs => {

				//playobs looks like: {playlist:{},tracks:[],artists:[],payload:[],db:[],lastLook:[]}
				//entries found in the the db will be returned in db, and those that were't go on payload
				//therefore, payload.length + db.length = artists.length

				//feature: depending on lengh of payload might it be advantangous to return some of that data immediately?
				/// or maybe wait until I at least hit spotify first

				console.log("db fulfilled & payloads created ==================================");
				console.log(playobs.length);

				var resolverPromises = []
				playobs.forEach(playob => {
					//is just looking at playob.payload - if its empty, it just returns the same object
					// resolverPromises.push(resolver.resolveArtists(playob,'payload'))
					resolverPromises.push(resolver.resolvePlayob(playob))
				})

				Promise.all(resolverPromises).then(resolvedPlayobs => {
					console.log("resolved payloads into artists ==================================");
					console.log(resolvedPlayobs.length);

					//the genres from the newly gathered spotifyArtists have no ids - go get them

					//testing: only use a couple playlists
					//done(resolvedPlayobs);

					//console.log("db population",playobs[0].db.length);
					//returns with a full artist object
					//console.log(playobs[0].db[0]);
					//console.log("spotifyArtists",playobs[1].spotifyArtists.length);
					//console.log(playobs[1].spotifyArtists[1]);

					//feature: trying to speed up n^n op here
					//sure theres a better solution tho - this whole 'mutate the repo thing'
					//will probably get old at some point but for testin the steps, its nice

					var artGenMap = {};

					//these resolved playobs may or may not have had to go and resolve spotify artists

					//feature: skipping spotify artists we couldn't find genres for
					//does this mean anything though? why would I commit artists to my db that I don't have genres for?
					//pretty sure the plan was to have resolveReturnArtists called above check lastLook when it's
					//trying to find previously recorded artist genre info and therefore prevent those artists from
					//getting put on the payload for resolvePlayob resolution attempts

					resolvedPlayobs.forEach(agr => {
						if (agr.spotifyArtists) {
							agr.spotifyArtists.forEach(artGen => {
								if (artGen.genres.length === 0) {
									artGenMap[artGen.id] = artGen.genres
								}
							});
						}
					});

					//feature: this could probably be done faster by combining with some other set
					//concerned about sql operations - purely for information gathering - acting as a bottleneck
					//outside of getting ids for existing/new genres, I guess everything else could wait?
					//our db entries have fully qualified genres - just send'em back

					//little weird...
					//so if even 1 of the playobs has an artist we need to resolve b/c we don't have any genres
					//we're going to enter the resolving loop. otherwise we'll just return right here.
					var p = JSON.stringify(artGenMap);
					if (p === JSON.stringify({})) {
						console.log("no spotifyArtists to commit");
						//console.log(app.jstr(playobs[0].artists[0]));
						//todo: change to 'resolved'
						done(playobs)
					}
						//commit new data to sql
						//commitPlayobs will return with fully qualified artists and genres we commited to db
					//and will rebind to return payload here
					else {
						//so if we committed everything that we obtained from spotifyArtists,
						//then when we can just do a big pull from the db to get genre-id resolved artists
						//for everything

						var pullPromises = [];
						//commitPlayobs only commits playobs.spotifyArtists for immediate retrieval below, fully qualifying genres in the process
						//if has no spotifyArtists, its just skipped
						//notice this is processing our entire dataset (not in a loop)
						db_api.commitPlayobs(playobs).then(function (justGetFromDb) {
							playobs.forEach(p => {
								//we already have the data we for all the db entries in playob.db
								//here we're going to get some new playobs that describe what were
								//were able to pull up after committing everything we learned from spotify
								//and then trying to pull that from the db
								pullPromises.push(db_api.checkDBForArtistGenres(p,'spotifyArtists'))
							});
							Promise.all(pullPromises).then(playobsResolved => {
								//console.log(app.jstr(playObsWithSpotifyArtists));
								console.log("resolvePlaylists finished execution:", Math.abs(new Date() - startDate) / 600);

								//feature: sort of abusing this 'playob' idea with this special 'spotifyArtistsResolved' BS
								//if checkDBForArtistGenres could find any genre information for the spotifyArtists we fed it
								//they'll be stored on these playob.db fields - otherwise it'll be in the 'payload' which is just
								//being abused here as normally this 'payload' would get fed elsewhere but here its just a signal
								//that yes indeed we couldn't find anything for them
								playobsResolved.forEach(p => {
									p.resolved = [];
									//p.resolved = p.db.concat(p.spotifyArtists)
									p.resolved = p.resolved.concat(p.db);
									p.spotifyArtistsResolved.forEach(playob=>{
										p.resolved = p.resolved.concat(playob.db);
										p.resolved = p.resolved.concat(playob.payload);
										//todo: when lastlook is functional
										//p.resolved = p.resolved.concat(playob.lastlook)
									})
									//p.resolved = p.db.concat(p.payload)
								})
								res.send(playobsResolved)
							})
						})
					}
				})
			}, e => { //resolveReturnArtists
				console.error(e);
			})
		}, e => {//resolvePlaylists
			console.error(e);
		})
	//testing: getUserPlaylists
	//})
}
