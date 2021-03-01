var SpotifyWebApi = require('spotify-web-api-node'); // Express web server framework

var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');
let sql = require("mssql")
var _ = require('lodash')
const transform = require('lodash').transform
const isEqual = require('lodash').isEqual
const isArray = require('lodash').isArray
const isObject = require('lodash').isObject
const jsonfile = require('jsonfile')
var Bottleneck = require("bottleneck");


var db_mongo_api = require('./db_mongo_api')
var db_api = require('./db_api.js');
var app = require('./app')
var resolver = require('./resolver.js');
var resolver_api = require('./resolver_api.js');
var util = require('./util')
var sample_events = require('./example data objects/event').events;

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


var scopes = all_scopes,
	// redirectUri = 'http://localhost:8888/callback',
	redirectUri = 'http://localhost:3000/redirect',
	//todo:
	state = 'some-state-of-my-choice';

var client_id = '0e7ef13646c9410293a0119e652b35f7'; // Your client id
var client_secret = 'a00084c5c193478e9fc5d9a0c0e70058'; // Your secret

var spotifyApi = {};

var credentials = {
	clientId: client_id,
	clientSecret: client_secret,
	// redirectUri:"cheat"
	redirectUri
};
console.log("spotifyApi setup (no tokens)");
spotifyApi = new SpotifyWebApi(credentials);

module.exports.getSpotifyWebApi =  function(){
	return new Promise(function(done, fail) {
		//console.log("spawned new SpotifyWebApi");
		var s = new SpotifyWebApi(credentials);
		done(s)
	})
};

//todo: so refresh is cheating
//but other than that I can't tell the difference here

module.exports.getAuth =  function(req,res){
	//console.log("getAuth...",req.body);
	getTokens(req.body.code)
		.then(r => {

			//todo: deal with everyone expecting this (doesn't work now?)
			//why the fuck is this here?
			module.exports.spotifyApi = req.body.spotifyApi;

			//note: exact clone of what happens in middleware (which we didn't hit this one time)
			//just so that we can return the user info right away
			me.getSpotifyWebApi()
				.then(api => {
					api.setAccessToken(r.access_token);
					api.setRefreshToken(r.refresh_token);
					api.getMe()
						.then(data => {
							r.user = data.body
							res.send(r);
						})
				}, e => {console.error(e);})
		}, e => {console.error(e);})
}

module.exports.refreshAuth =  function(req,res){
	//console.log("getAuth...",req.body);
			console.log("refresing via client refresh_token...",req.body.access_token);
			var authOptions = {
				method:"POST",
				url: 'https://accounts.spotify.com/api/token',
				headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
				form: {
					grant_type: 'refresh_token',
					refresh_token: req.body.refresh_token
				},
				json: true
			};
			rp(authOptions).then(function (result) {
				console.log("new access_token from refresh",result.access_token);
				res.send({access_token: result.access_token})
			}).catch(function (err) {
				console.log(err.error);
				fail(err);
			})
}

// var global_access_token = "";
var getTokens =  function(code){
	return new Promise(function(done, fail) {
		//console.log("getTokens...",code);
		var authOptions = {
			method:"POST",
			url: 'https://accounts.spotify.com/api/token',
			headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
			form: {
				redirect_uri:redirectUri,
				grant_type: 'authorization_code',
				code: code
			},
			json: true
		};

		rp(authOptions).then(function (res) {
			//	console.log("$res",res)
			done(res);
		}).catch(function (err) {
			console.log(err.error);
			fail(err);
		})
	})
}


// module.exports.setToken_implicit_Grant =  function(token){
// 	console.log("setToken",token);
// 	//console.log("setToken DISABLED");
// 	return new Promise(function(done, fail) {
// 		var credentials = {
// 			clientId: client_id,
// 			clientSecret: client_secret,
// 			// redirectUri:"cheat"
// 			redirectUri
// 		};
// 		//testing:
// 		spotifyApi = new SpotifyWebApi(credentials);
// 		console.log("new global_access_token from client",token);
//
//
// 		module.exports.spotifyApi = spotifyApi;
// 		spotifyApi.setAccessToken(token);
// 		me.token = token;
// 		done()
// 	})
// }

//var global_refresh_franky = "AQDn9X-9Jq2e-gbcZgf-U4eEzJadw2R6cFlXu1zKY-kxo3CEY4FaLtwL8tw7YcO8QPd2h3OXcSTvOQwKG5kmpOz2Nm6MTrHfM0r4UGQ7A7Aa-z8tywMvbgVyWmgLcEXDlVw";
var global_refresh_franky = "AQCztbDoyoh4DfOMjdOwNlr6b6AIPfuIEPf1WLRtMPk2CGXh_lDu_6cHX5Iz0nt5RHdzYeRj3_rUbLxMfMVjCq4H0U03fs13v1ypCqkdWiGMr4sYQaehCMI5KOqxL39wTDI"
//var global_refresh_dan = "AQDRaPbAH9oSHZ3xKHxbxHZtsJrvry2gr6x-swN4uddSuc_InwPNaaJG7l9ZCKIRzDzUEAGk6tSD4GCyks79J0vcICT1l6yvKDZym3nqQzrG860UPUCu_lMFKzZPZVuc9wc"

var global_refresh = global_refresh_franky

// var global_access_token = "";
var refresh =  function(){
	return new Promise(function(done, fail) {
		console.log("refresing via global_refresh...");
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
			console.log("new global_access_token from refresh",res.access_token);
			done(res.access_token);
		}).catch(function (err) {
			console.log(err.error);
			fail(err);
		})
	})
}


module.exports.getCheatyToken =  function(){
	return new Promise(function(done, fail) {
		var credentials = {
			clientId: client_id,
			clientSecret: client_secret,
			// redirectUri:"cheat"
			redirectUri
		};
		var spotifyApi = new SpotifyWebApi(credentials);
		refresh().then(token =>{
			spotifyApi.setAccessToken(token);
			done(spotifyApi)
		});
	})
}

//testing:
//doUserAuth()

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
//utility
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
 * Paging using manually calculated offsets
 * @param key Is now the singular known (artist NOT artists)
 * */
var pageIt =  function(req,key,data){
	return new Promise(function(done, fail) {
		if(!(data)){data=key;key=null;}
		if(data.body.next){
			console.log("pageIt",data.body.next);
			//console.log("key",key);
			resolver.getPages(req,data.body,key)
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
var preserve = null;

/**pageItAfter
 * For endpoints that use 'next' (as opposed to offset)
 *
 * */

var pageItAfter =  function(key,pages,req,data){
	return new Promise(function(done, fail) {
		//what does this binding thing mean again?
		//console.log(data);
		preserve === null? preserve= JSON.parse(JSON.stringify(data.body)):{};
		if(!(data)){data=key;key=null;}
		if(data.body.next){
			//console.log("pageItAfter",data.body.next);

			//console.log("key",key);
			resolver.getPage(data.body,key,req)
				.then(r =>{
					pages.push(r)
					if(r.artists.next){
						pageItAfter('',pages,req,{body:{next:r.artists.next}}).then(done).catch(fail)
					}
					else{
						//get the original result
						//console.log(preserve);
						var body = {items:preserve.artists.items}
						pages.forEach(p =>{
							body.items =  body.items.concat(p.artists.items)
						})
						preserve =null
						done(body);
					}
				})
				.catch(e => console.error(e))
		}else{
			preserve = null
			done(data.body)}
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


//todo: shouldn't really be exposing this like this...
me.getToken = function (req,res) {
	res.send(module.exports.token)
};



//user methods =================================================
//==============================================================

//todo: hardcoded user name

me.getUserPlaylists = function (req,res) {

	//dacandyman01
	req.body.spotifyApi.getUserPlaylists('dacandyman01', {limit: 50})
		.then(pageIt.bind(null,req,null))
		.then(function (r) {


			res.send(r);
		}, function (err) {
			console.error('getUserPlaylists failed', err);
		});
}


var getUserProfile =  function(req,u){
	return new Promise(function(done, fail) {
		//	https://api.spotify.com/v1/users/{user_id}
		let uri = "https://api.spotify.com/v1/users/"+ u.id;
		let options = {uri:uri, headers: {"Authorization":'Bearer ' + req.body.spotifyApi.getAccessToken()}, json: true};
		rp(options)
			.then(function (r) {
				done(r);
			}, function (err) {
				console.error('getUserProfile failed');
				console.error(err);
			});
	})
}


//todo: remove self from users, collabUsers

/** getUserPlaylistFriends
 *  @desc search thru all of a user's playlists for users that aren't Spotify {users}
 *  and also detect which ones are collaborations and return those users in {collabUsers}
 *
 * @param req.body.user.id
 * */
me.getUserPlaylistFriends = function (req,res) {

	//testing:
	//var user = 'tipshishat';
	//var user = {id:'dacandyman01'};
	req.body.spotifyApi.getUserPlaylists(req.body.user.id, {limit: 50})
		.then(pageIt.bind(null,req,null))
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

				p.owner.id !== req.body.user.id ? users.push(p.owner):{};


				//todo: weird shit with Kim
				//for some reason I thought I needed to go resolve these profiles, not true so can ignore i guess...

				//p.owner.id == '1217637895' ? console.log(numericId.exec('1217637895')):{};
				//p.owner.id == '1240498738' ? console.log(numericId.exec('1240498738')):{};

				p.id === '7pH9FCTIUwEEc2NkCBjeJ6' ? console.log(p):{};

				p.owner.id !== req.body.user.id ? users.push(p.owner):{};
				p.collaborative ? collabUsers.push({owner:p.owner,id:p.id,name:p.name}):{}
			});

			users = _.uniqBy(users, function(n) {return n.id;});
			collabUsers = _.uniqBy(collabUsers, function(n) {return n.owner.id;});



			//body.items is just every playlist from the user I think
			// res.send(body.items);

			//testing: resolving only collab playlists tracks to mine added_by users
			req.body.playlists = collabUsers.map(r =>{ return {id:r.id}});
			var collabMembers = [];

			//todo: get playlist id? seems a little overkill for this purpose right?
			resolver.resolvePlaylists(req.body)
				.then(results => {
					results.forEach(r =>{
						r.tracks.forEach(t =>{
							collabMembers.push(t.added_by)
						})
					})
					collabMembers = _.uniqBy(collabMembers, function(n) {return n.id;});

					var collabMembersids = collabMembers.map(r =>{ return r.id});
					var collabUsersids = collabUsers.map(r =>{ return r.owner.id});
					var userids = users.map(r =>{ return r.id});
					var ids = collabMembersids.concat(collabUsersids);
					ids = ids.concat(userids)
					ids = _.uniq(ids);
					//console.log(ids);


					//testing:
					//ids = ids.slice(0,5)

					var limiterSpotify = new Bottleneck({
						maxConcurrent: 10,
						minTime: 100,
						trackDoneStatus: true
					});
					//todo: put limiter on here
					var profileProms = [];
					ids.forEach(i =>{profileProms.push(limiterSpotify.schedule(getUserProfile,req,{id:i},{}))})
					// ids.forEach(i =>{profileProms.push(getUserProfile(req,{id:i}))})



					Promise.all(profileProms)
						.then(presults =>{
							console.log(presults);

							console.log("users",users.length);
							console.log("collabUsers",collabUsers.length);
							console.log("collabMembers",collabMembers.length);

							presults.forEach(pres =>{
								users.forEach(u =>{
									u.id === pres.id ? u.images = pres.images:{};
								})
								collabUsers.forEach(uob =>{
									uob.owner.id === pres.id ? uob.owner.images = pres.images:{};
								})
								collabMembers.forEach(u =>{
									u.id === pres.id ? u.images = pres.images:{};
								})
							})


							res.send({users:users,collabUsers:collabUsers,collabMembers:collabMembers});
						},e =>{res.status(500).send(this.name + " :" + e)})

				},e =>{res.status(500).send(this.name + " :" + e)})


		}, function (err) {
			console.error('getUserPlaylists failed:');
			console.error(err);
		});
}

/** getFollowedArtists
 * @desc
 * @param req
 * @param res
 */

var getFollowedArtists =  function(req){
    return new Promise(function(done, fail) {
		console.log("getFollowedArtists",req.body.spotifyApi.getAccessToken());
		//comparing spotifyApi here to sucessful one in resolvePlaylists
		// console.log("getFollowedArtists... is forbidden? spotifyApi:",spotifyApi);
		// this.name = "getFollowedArtists";
		//fully qualified artist objects include genres
		//todo: not sure on limit of this yet
		//https://developer.spotify.com/documentation/web-api/reference/follow/get-followed/

		var pages = [];
		req.body.spotifyApi.getFollowedArtists({limit:50})
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
				//note: AS IN THE NORMAL VALUE RETURNED BY THE PROMISE WILL ALWAYS BE THE LAASSSTTTT
				//in the params list of the binded function
				//for the bound function in the function's param list
				//hence it pageit doesn't not use this, has a key value and then takes the data
				//passed via promise chaining as its last arg

			})
			.then(pageItAfter.bind(null,'artist',pages,req))
			.then(r =>{
				//skipping artist lookup, but keeping genre inpuit
				var artistsPay = r.items;
				//console.log("artistsPay",artistsPay.length);
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
			.then(r =>{

				r.artists.forEach(a =>{
					a.familyAgg = util.familyFreq(a);
					//testing: assigning sort value here, like term in topArtists
					a.followed = true;
				})

				//console.log(r.items.length + " " + r.artists.items.length);
				// console.log(this.name + " :" + r.length);
				//res.send(r.artists.items);
				//testing:

				done(r.artists);

			})
			.catch(err =>{
				//console.error("getFollowedArtists this just prints on start i guess?",err);
				console.error("getFollowedArtists",err);
				fail(err)
				//next(e.body)
			})
    })
}

me.getFollowedArtists =  function(req,res){
	getFollowedArtists(req)
		.then(r => {res.send(r)})
		.catch(e =>{res.status(500).send(e)})

}


//todo: regarding getMySavedTracks and getMySavedAlbums
//#1 interestingly...
//when I pass artistsPay to commit + checkDB, because of how I setup the albumOb.body.items,
//I'm actually passing a reference to this original albumOb to be checked
//so albumOb.items come back fully qualified b/c they were qualified in place by reference

//todo: regarding getMySavedAlbums,getTopArtists, getMySavedTracks
//not doing anything with 'couldn't find artists' printout

//todo: duplicate code b/c not figuring out branching promises rn
me.getMySavedTracksLast =  function(req,res){
		var trackOb = {};
		req.body.spotifyApi.getMySavedTracks({limit : 5})
			.then(pagedRes =>{
				trackOb = pagedRes.body;
				var artists = [];
				trackOb.items.forEach(item =>{
					artists = artists.concat(_.get(item,'track.artists'));
				})

				//prune duplicate artists from track aggregation
				artists = _.uniqBy(artists, function(n) {return n.id;});

				//resolving all the artists for all the tracks
				return resolver.resolveArtists(req,artists)
					.then(empty =>{
						var pullArtists = [];
						trackOb.items.forEach(item =>{
							delete item.track.album.artists;

							//I just don't like looking at these
							item.track.available_markets = null;
							item.track.album.available_markets = null;

							item.track.artists.forEach(a =>{
								pullArtists.push(a)
							})
						});

						return db_api.checkDBForArtistGenres({payload:pullArtists},'payload')
							.then(resolvedArtists =>{
								return trackOb.items;
							})
					})
			})
			.then(r =>{
				res.send(r);
			}, function(err) {
				console.log('getMySavedTracks failed', err);
			});
	};

/** getMySavedTracks
 * @desc Get tracks in the signed in user's Your Music library
 * @param req
 * @param res
 */


me.getMySavedTracks =  function(req,res){
	var trackOb = {};
	req.body.spotifyApi.getMySavedTracks({limit : 50})
		.then(pageIt.bind(null,req,null))
		.then(pagedRes =>{
			trackOb = pagedRes;
			var artists = [];
			trackOb.items.forEach(item =>{
				artists = artists.concat(_.get(item,'track.artists'));
			})

			//prune duplicate artists from track aggregation
			artists = _.uniqBy(artists, function(n) {return n.id;});


			//resolving all the artists for all the tracks
			return resolver.resolveArtists(req,artists)
				.then(empty =>{
					var artistsPay = [];

					//resolveArtists now calls commitArtistGenres by itself, so we don't need
					//to do that here anymore. instead we just need to create an artist payload
					//out of the trackOb items and then map them back

					var pullArtists = [];

					trackOb.items.forEach(item =>{
						//note: theres an artist listing on both: items[0].track.album.artists AND a items[0].track.artists
						//the difference between the album's artist(s) and a track's artist(s)
						//well remove the album one for now
						delete item.track.album.artists;

						//I just don't like looking at these
						item.track.available_markets = null;
						item.track.album.available_markets = null;

						item.track.artists.forEach(a =>{
							pullArtists.push(a)
						})
					});



					//testing:
					//pullArtists = pullArtists.slice(0,5)

					//this will mutate the object I send at the field, so do this little cheat
					//it will also return the values - but I guess I'm not doing that for ...some good reason
					return db_api.checkDBForArtistGenres({payload:pullArtists},'payload')
						.then(resolvedArtists =>{

							// const file = 'temp.json'
							// var res = (async () => {
							// 	jsonfile.writeFile(file,  trackOb.items)
							// 	jsonfile.readFile(file,  trackOb.items)
							// 		.then(r =>{
							// 			return r;
							// 			//console.log("$",r.length)
							// 		})
							// })();

							//return res;
							return trackOb.items;


							// trackOb.items.forEach(t=>{
							//
							// })

							//todo: now do stuff! lol fuck me:)


						})


					//from when I wasn't do commits inside of resolveArtists

					//todo: here starting to question why I make these commits never return anything
					//and instead went with this convention in resolvePlaylists of commitPlayobs then checkDBForArtistGenres
					//I guess b/c it was just too involved to put together the object I want after having to take all these steps
					//in order to commit genres and artists and get back artists with fully qualified genres?
					//for now just keeping that convention I guess...

					//but now that I'm accidentally passing references down the line, maybe this wasn't such a bad idea
					//lot of data but very clean output for me to analyze

				})
		})
		.then(r =>{
			res.send(r);
		}, function(err) {
			console.log('getMySavedTracks failed', err);
		});
};

//todo: BROKEN (test req.spotifyApi)

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


/**
 * getTopArtists
 *
 * @param req.range = one of these enums:
 *
 * long_term (calculated from several years of data and including all new data as it becomes available)
 medium_term (approximately last 6 months)
 short_term (approximately last 4 weeks)

 https://developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/
 */

//note: manual API
var getTopArtists =  function(req){
    return new Promise(function(done, fail) {

		//thought about paraming but why not just get it all?
		//fetch all versions of this, break apart and then qualify

		var termProms = [];
		var ranges = ["long_term","medium_term","short_term"];

		ranges.forEach(r =>{
			let uri = "https://api.spotify.com/v1/me/top/artists?limit=50&offset=0&time_range=" + r;
			let options = {uri:uri, headers: {"Authorization":'Bearer ' + req.body.spotifyApi.getAccessToken()}, json: true};
			termProms.push(rp(options))
		});


		//this comes with genres just not MY qualified ones
		//so usual process of committing in order to get qualified genres back
		Promise.all(termProms).then(r => {

			var artists = [];
			var termMap = {};
			var resolvedMap = {long:[],medium:[],short:[]};

			r.forEach((tres,i)=>{
				artists = artists.concat(tres.items);
				//recall order of promise returns IS guaranteed
				//gotta do this mapping somehow...
				switch (i) {
					//was about to assign this just on the object itself but sql :(
					// case 0:{tres.items.forEach((r,i,arr) =>{arr[i].term = 'long'});break;}
					// case 1:{tres.items.forEach((r,i,arr) =>{arr[i].term = 'medium'});break;}
					// case 2:{tres.items.forEach((r,i,arr) =>{arr[i].term = 'short'});break;}
					case 0:{tres.items.forEach(i =>{termMap[i.id] = 'long'});break;}
					case 1:{tres.items.forEach(i =>{termMap[i.id] = 'medium'});break;}
					case 2:{tres.items.forEach(i =>{termMap[i.id] = 'short'});break;}

				}
			})

			artists =  _.uniqBy(artists, function(n) {return n.id;});
			db_api.commitArtistGenres(artists)
				.then(justGetFromDb =>{
					db_api.checkDBForArtistGenres({artists:artists},'artists')
						.then(result =>{
							if(result.db.length !== result.artists.length){
								console.log("couldn't find " + result.payload.length + " artists");
							}
							result.resolved = result.db.concat(result.payload);
							//console.log(result.resolved.length);

							//map the term value for the artist back onto itself according to the map
							//also add familyAgg
							result.resolved.forEach((a,i,arr)=>{
								// termMap[a.id] ? resolvedMap[termMap[a.id]].push(a):{};
								termMap[a.id] ? arr[i].term = termMap[a.id]:{};
								util.familyFreq(a)
							});

							done(result.resolved)
							//res.send(resolvedMap)
						})
				},err =>{fail(err)})
		},err =>{
			console.error("getTopArtists mystery error?",err);
			fail(err)
		})
    })
}

me.getTopArtists = function(req,res){

	getTopArtists(req)
		.then(r => {res.send(r)})
		.catch(e =>{res.status(500).send(e)})

};

//always a max of 50 tracks
me.getRecentlyPlayedTracks=  function(req,res){
	var trackOb = {};
	req.body.spotifyApi.getMyRecentlyPlayedTracks({limit : 50})
		.then(result =>{
			var artists = [];
			result.body.items.forEach(item =>{
				artists = artists.concat(_.get(item,'track.artists'));
			})

			//prune duplicate artists from track aggregation
			artists = _.uniqBy(artists, function(n) {return n.id;});
			//console.log(artists);

			//resolving all the artists for all the tracks in place
			return resolver.resolveArtists(req,artists)
				.then(empty =>{
					//console.log(empty);
					var pullArtists = [];
					result.body.items.forEach(item =>{
						//note: theres an artist listing on both: items[0].track.album.artists AND a items[0].track.artists
						//the difference between the album's artist(s) and a track's artist(s)
						//well remove the album one for now
						delete item.track.album.artists;

						//I just don't like looking at these
						item.track.available_markets = null;
						item.track.album.available_markets = null;

						item.track.artists.forEach(a =>{
							pullArtists.push(a)
						})
					});

					//definitely could be dupe artists
					pullArtists = _.uniqBy(pullArtists, function(n) {return n.id;});
					//possible if you just keep playing the same song lol
					result.body.items = _.uniqBy(result.body.items, function(n) {return n.track.id;});

					//testing: limited #
					//pullArtists = pullArtists.filter(r =>{return r.id==='2Ceq5nkABzryK0OkaQYtzg' || r.id==='4EOyJnoiiOJ4vuNhSBArB2' });
					// console.log(pullArtists.filter(r =>{return r.id==='4EOyJnoiiOJ4vuNhSBArB2'}));

					//this will mutate the object I send at the field, so do this little cheat
					//it will also return the values - but I guess I'm not doing that for ...some good reason
					return db_api.checkDBForArtistGenres({payload:pullArtists},'payload')
						.then(resolvedArtists =>{


							function jval(v){return JSON.parse(JSON.stringify(v))}

							var aMap = {};
							pullArtists.forEach(a =>{
								a.familyAgg = util.familyFreq(a);
								a.source = 'recent';
								aMap[a.id]= a;
							})

							//replace artists with amap values
							result.body.items.forEach(t =>{
								Object.assign(t,t.track);delete t.track;
								t.artists.forEach((a,i,arr) =>{
									arr[i] = aMap[a.id]
								})
							})

							//for some reason, thought adding specific tracks to artist payload was a good idea
							//doesn't make any fucking sense tho

							//var aMap = {};
							// result.body.items.forEach(t =>{
							// 	//destroying  'track' at track
							//
							// 	t.artists.forEach(a =>{
							// 		//todo: some kind of circular json issue
							// 		//has to be to do with artists I'd imagine (plus I mean I'm being lazy as shit, lot of repeated junk here)
							// 		if(!aMap[a.id]){aMap[a.id] = [jval(t)]}
							// 		else{aMap[a.id].push(jval(t))}
							// 	})
							// });
							// //console.log("$map",aMap);
							// pullArtists.forEach(a =>{
							// 	// a.tracks = JSON.stringify(aMap[a.id])
							// 	a.tracks = aMap[a.id]
							// })
							//todo: obvious waste of data sending both back
							return {tracks:result.body.items,artists:pullArtists};
							//return {tracks:result.body.items};
						})
				})
		})
		.then(r =>{
			res.send(r);
		}, function(err) {
			console.log('getMySavedTracks failed', err);
		});
};


//static user methods =================================================
//=====================================================================

//todo: BROKEN - redid user objects
me.fetchStaticUser = function(req,res){

	db_mongo_api.fetchStaticUser('Dan')
		.then(r =>{

			res.send(r);
		},err =>{res.status(500).send(err)})

};


me.storeStaticUser = function(req,res){

	//called separately
	//getUserPlaylistFriends

	//getTopArtists(req)
	//getFollowedArtists

};

//=================================================
//non-user methods

//todo: figure out how to call this locally (tried to use middleware caller...)
//or just break it down - I'm just SOOO LAAZZZY
me.test  = function(req,res){

	var res2 = {send:function(tracks){

			//console.log("$events",events);
			//console.log(artist.id)
			//console.log(tracks);
			//var e = _.find( events,{'performance':artist.id});

			var artist = {id:210595};
			sample_events.forEach(e =>{
				//console.log(artist.id);
				var a = _.find(e.performance,['artist.id', artist.id]);
				if(a){
					!(e.spotifyTopFive) ? e.spotifyTopFive = {}:{};
					//console.log("set");
					e.spotifyTopFive[artist.id] = tracks;
				}
			})
			//console.log(sample_events);
			res.send(sample_events)



			// var songkickOb = {id:item.id,name:item.name,artistSongkick_id:artist.id,displayName:artist.name,genres:item.genres}
			// songkickOb.newSpotifyArtist = item;
			//
			// aas_promises.push(db_api.commit_artistSongkick_with_match(songkickOb));
			// obs.push(songkickOb)

			//modify the result with that songkick id from events and commit the events
		}};

	res2.send({track:1})
	//calling locally = callback above instead of promise resolution
	//me.getArtistTopTracks({body:{id:item.id}},res2)

}

//testing: converted from endpoint to utility
// called from authorization_code/songkick.js @ fetchMetroEvents

me.getArtistTopTracks  =  function(req){
	return new Promise(function(done, fail) {
		//console.log("$getArtistTopTracks",req.body.id);
		req.body.spotifyApi.getArtistTopTracks(req.body.id, 'ES')
			.then(r =>{done(r.body.tracks)},e =>{fail(e)})
		//.then(r => { res.send(r.body.tracks)},err =>{res.status(500).send(err)})
	})
}


//other methods----------------------------------------------------------

me.createPlaylist = function(req,res){
	console.log("createPlaylist",req.body.songs.length);
	req.body.spotifyApi.createPlaylist(req.body.user.id,req.body.playlist.name, { 'description': 'My description', 'public': true })
		.then(r => {
			var payload = [];
			req.body.songs.forEach(id =>{
				payload.push("spotify:track:" + id)
			})
			spotifyApi.addTracksToPlaylist(r.body.id,payload)
				.then(function(data) {
					console.log('Added tracks to playlist!');
				}, function(err) {
					console.log('Something went wrong!', err);
				});
			res.send(r)},err =>{res.status(500).send(err)})
};

//WIP----------------------------------------------------------

//todo: move artist to req.artist
//todo: for some reason I turned this into an api function

// me.searchArtist = function (req,res,next) {
// 	var artist = {name:"Queen"};
// 	//console.log(query);
// 	spotifyApi.searchArtists(artist.name)
// 		.then(function (r) {
// 			 done({artist: artist, result: r})
// 			//res.send(r);
// 		}, function (err) {
// 			console.error(err);
// 			next(err)
// 		});
// };

//this is exposed for use by songkick only pretty much?
me.searchArtist  =  function(req){
	return new Promise(function(done, fail) {
		//console.log("searchArtists",req.body.artist.name);
		//todo: only fixing for songkick for now
		//will return to test later when this endpoint is back up on UI
		//basically: if we didn't get one from the middleware, its not coming from the UI - so make your own

		req.body.spotifyApi.searchArtists(req.body.artist.name)
			.then(function (r) {
				done({artist: req.body.artist, result: r})
				//res.send(r);
			}, function (err) {
				console.error(err);
				fail(err);
			});

		function fn() {
			req.body.spotifyApi.searchArtists(req.body.artistQuery)
				.then(function (r) {
					done({artist: req.body.artistQuery, result: r})
					//res.send(r);
				}, function (err) {
					console.error(err);
					fail(err);
				});
		}

	})

}


//exposing an endpoint that uses it to the UI
me.completeArtist = function(req,res){

	//todo: ajax thing (or not jesus lol fix this!)
	//console.log(req.body.artistQuery);
	//req.body.artistQuery ="Queen"

	me.searchArtist(req)
		.then(r => {

			//no no I HAVE genres, I don't have QUALIFIED genres
			// var ids = r.result.body.artists.items.map(a =>{return a.id})
			// resolver_api.spotifyArtists(ids)
			// 	.then(r =>{
			// 		res.send(r);
			// 	},err =>{res.status(500).send(err)})

			//todo: this is similar to the (very messy) process for fetchMetroEvents
			//... checkDBFor_artist_artistSongkick_match in songkick.js

			//but I don't really 'need' to worry about submitting every searched artist
			//into my DB? but I do need to know if my system already knows about the genre

			//testing: for now, just do the bare minimum until I do a rerwrite on ^^^

			var qualifyGenrePromises = [];
			r.result.body.artists.items.forEach(r =>{
				//todo: if we passed the whole artist = replace in place
				//for now just do a costly unwind later
				// qualifyGenrePromises.push(qualifyGenres(r.genres))
				r.genres.forEach(g =>{
					qualifyGenrePromises.push(db_api.qualifyGenre(g));
				})
			})

			//console.log(qualifyGenrePromises.length);
			Promise.all(qualifyGenrePromises)
				.then(r2 =>{
					r.result.body.artists.items.forEach((r,i,arr) =>{
						//todo: if we passed the whole artist = replace in place
						//for now just do a 'costly' unwind later (its 20 artists how many genres could there be? :))
						// qualifyGenrePromises.push(qualifyGenres(r.genres))
						var gsqual = [];
						r.genres.forEach((gName,i,arr) =>{
							var f = _.find(r2, function(gq) {
								return gName === gq.name;
							});
							gsqual.push(f);
						})
						arr[i].genres = gsqual;
					})
					res.send(r);

				},err =>{res.status(500).send(err)})
		},err =>{res.status(500).send(err)})

};


me.sortSavedTracks  =  function(req,res){
	return new Promise(function(done, fail) {
		//testing: method for calling endpoints from local functions
		//basically just send a res that will be the callback
		//and remove the .then() from it b/c it will be immediately undefined otherwise
		var req2 = {};var res2 = {send:function(d){
				console.log("here",d)
				res.send(d);
			}};
		me.getMySavedTracks(req2,res2)
		console.log("fun!");
		// spotifyApi.getMySavedTracks({limit : 50})
		// 	.then(function (r) {
		// 		done({artist: artist, result: r})
		// 		//res.send(r);
		// 	}, function (err) {
		// 		console.error(err);
		// 		fail(err);
		// 	});
	})
}

//=================================================
//resolving methods


function difference(origObj, newObj) {
	function changes(newObj, origObj) {
		let arrayIndexCounter = 0
		return transform(newObj, function (result, value, key) {
			if (!isEqual(value, origObj[key])) {
				let resultKey = isArray(origObj) ? arrayIndexCounter++ : key
				result[resultKey] = (isObject(value) && isObject(origObj[key])) ? changes(value, origObj[key]) : value
			}
		})
	}
	return changes(newObj, origObj)
}

me.getSnapshotDelta= function(req,res) {

	snapshotPlaylists(req)
		.then(tuple => {
			//console.log("current snap",tuple.snap);
			db_mongo_api.fetchStaticUser(req.body.user)
				.then(r =>{
					//console.log("cache snap",r[0].snapMap);
					var d = difference(tuple.snap,r[0].snapMap)
					var ret = []
					if(d){
						//resolve these playlists
						Object.keys(d).forEach(id =>{ret.push(tuple.imap[id])})

						// var diffObArray = Object.keys(d).map(k =>{return {id:k}})
						// req.body.playlists = diffObArray
						// resolver.resolvePlaylists(req.body)
						// 	.then(r =>{
						// 		console.log(r);
						// 	})
					}
					res.send(ret)
				})

			// db_mongo_api.saveSnapshotPlaylists(req.body.user.id,snap)
			// 	.then(r =>{
			// 		console.log("snapshotPlaylists finished",r);
			// 	})
		})
}

var snapshotPlaylists =  function(req){
    return new Promise(function(done, fail) {
		req.body.spotifyApi.getUserPlaylists(req.body.user.id, {limit: 50})
			.then(pageIt.bind(null, req, null))
			.then(r => {
				console.log("total playlists length", r.items.length);
				var snap = {};
				var imap = {};
				r.items.filter(item =>{return item.owner.id === req.body.user.id})
				.forEach(p =>{
					imap[p.id] = p;
					snap[p.id] = p.snapshot_id
				})

				//testing: save new snap
				// console.log("new snap",snap);
				// db_mongo_api.saveSnapshotPlaylists(req.body.user,snap)
				// 	.then(r =>{
				// 		console.log("snapshotPlaylists finished",r.result);
				// 	})
				done({snap:snap,imap:imap})
			})
    })
}


me.resolvePlaylists = function(req,res){
	let startDate = new Date();


	console.log("resolvePlaylists start time:", startDate);
	//console.log(req.body);
	//todo: requests from UI => just the playlists key is stringified - why?
	//req.body.playlists = JSON.parse(req.body.playlists);
	//console.log("req.body.playlists", req.body.playlists);

	//todo:
	req.body.spotifyApi.getUserPlaylists(req.body.user.id, {limit: 50})
		.then(pageIt.bind(null,req,null))
		.then(r => {
			console.log("total playlists length",r.items.length);
			req.body.playlists = r.items;

			function matchMadeForYou(i){
				var pats = [/^Daily Mix/]
				for(var x = 0; x < pats.length; x++){
					if(pats[x].test(i.name)){
						//console.log(i.name);
						return true
					}
				}
			}

			//testing:
			// req.body.madeForYou = true;
			//
			// if(req.body.madeForYou){
			// 	console.warn("filtering for madeForYou");
			// 	req.body.playlists = req.body.playlists.filter(i =>{
			// 		return i.owner.id === 'spotify' && matchMadeForYou(i)
			// 	})
			// }

			//testing: madeByYou
			// req.body.madeByYou = true;
			//
			// if(req.body.madeByYou){
			// 	console.warn("filtering for madeByYou");
			// 	req.body.playlists = req.body.playlists.filter(i =>{
			// 		return i.owner.id === req.body.user.id
			// 	})
			// }


			//r.madeForYou = r.items.length

			//testing: various different methods...

			// console.warn("filter out > 100 songs");
			// req.body.playlists = req.body.playlists.filter(p =>{
			// 	return !(p.tracks.total > 100)
			// })

			var lim = 20;
			console.warn("tested with limited # of playlists:",lim);
			req.body.playlists = req.body.playlists.slice(0,lim);

			//todo: filter out by # of unique artists?

			console.log("resolving:",req.body.playlists.length);
			resolver.resolvePlaylists(req.body)
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

					//note: playob profile: {playlist:{},tracks:[],artists:[]}
					//console.log(app.jstr(playobs));

					var promises = [];
					playobs.forEach(function (playob) {
						promises.push(db_api.checkDBForArtistGenres(playob,'artists'))
					})

					Promise.all(promises).then(playobs => {

						//note: playob profile: {playlist:{},tracks:[],artists:[],payload:[],db:[],lastLook:[]}
						//entries found in the the db will be returned in db, and those that were't go on payload
						//therefore, payload.length + db.length = artists.length

						//feature: depending on length of payload might it be advantangous to return some of that data immediately?
						//right now if the playlist has ANY payload.lengh, we send it on thru


						console.log("db fulfilled & payloads created ==================================");
						//console.log(playobs.length);

						var resolverPromises = [];
						//set this in memory before we start trying to qualify genres
						resolverPromises.push(db_api.setFG())

						var fullyResolvedPlayobs = [];
						playobs.forEach(playob => {
							if(!(playob.payload.length === 0)){
								resolverPromises.push(resolver.resolveArtists(req,playob.payload))
							}
							else{fullyResolvedPlayobs.push(playob)}
						})

						console.log("resolverPromises",resolverPromises.length);
						console.log("fullyResolvedPlayobs",fullyResolvedPlayobs.length);

						Promise.all(resolverPromises).then(whocares => {
							//the original playobs have the payloads and all that
							//and we're banking on resolveArtists having sucessfully commited to the db
							//so now we just need to pull everything that was in a payload and combine that
							//with our already present db results

							/** @REWRITE
							 *  Trying to prepare to eventually split off the work required to commit new data to the db from
							 *  returning the newly fetched data. currently we will later on fully qualify the playobs's genres
							 *  - now we're going to do that within resolvePlayob. I don't really need to be returning nayth
							 */

								//testing: only use a couple playlists
								//done(resolvedPlayobs);

								//console.log("db population",playobs[0].db.length);
								//returns with a full artist object
								//console.log(playobs[0].db[0]);
								//console.log("spotifyArtists",playobs[1].spotifyArtists.length);
								//console.log(playobs[1].spotifyArtists[1]);

							var pullPromises = [];

							playobs.forEach(p => {
								//we already have the data we for all the db entries in playob.db
								//so go and MUTATE entries in playob.payload with our db results
								//note: specifically passing playobs w/out a payload here b/c they must come back
								pullPromises.push(db_api.checkDBForArtistGenres(p,'payload'))
							});

							Promise.all(pullPromises).then(playobsResolved => {
								//console.log(app.jstr(playObsWithSpotifyArtists));
								console.log("resolvePlaylists finished execution:", Math.abs(new Date() - startDate) / 600);
								console.log("playobsResolved",playobsResolved.length);
								//feature: sort of abusing this 'playob' idea with this special 'spotifyArtistsResolved' BS
								//if checkDBForArtistGenres could find any genre information for the spotifyArtists we fed it
								//they'll be stored on these playob.db fields - otherwise it'll be in the 'payload' which is just
								//being abused here as normally this 'payload' would get fed elsewhere but here its just a signal
								//that yes indeed we couldn't find anything for them

								var stats = {created:0,followed:0,recent:null,oldest:null};

								playobsResolved.forEach(p => {
									//console.log(p.playlist.owner.id);
									p.resolved = [];
									//p.resolved = p.db.concat(p.spotifyArtists)
									p.resolved = p.resolved.concat(p.db);
									p.resolved = p.resolved.concat(p.payload);

									//go thru every track and record the artist into artistFreq w/ a # representing the freq

									p.artistFreq = {};
									p.tracks.forEach(t =>{
										//most recently modified should only check user created playlists
										if(p.playlist.owner.id === req.body.user.id ){
											//set baselone recent
											stats.recent === null ? stats.recent = {playlist_id:p.playlist.id,playlist_name:p.playlist.name,added_at:new Date(t.added_at)}:{};
											stats.oldest === null ? stats.oldest = {playlist_id:p.playlist.id,playlist_name:p.playlist.name,added_at:new Date(t.added_at)}:{};
											var d1 = new Date(t.added_at);
											if(stats.recent.added_at < d1){
												stats.recent = {playlist:p.playlist.id,playlist_name:p.playlist.name,added_at:new Date(t.added_at)}
											}
											if(stats.oldest.added_at > d1){
												stats.oldest = {playlist:p.playlist.id,playlist_name:p.playlist.name,added_at:new Date(t.added_at)}
											}
										}

										!(p.artistFreq[t.track.artists[0].id]) ? p.artistFreq[t.track.artists[0].id] =1: p.artistFreq[t.track.artists[0].id]++;
									});

									//count created
									if(p.playlist.owner.id === req.body.user.id){stats.created = stats.created + 1;}

									//go thru every artist and thru all their genres and find each genre's family
									//appends the family name as "familyAgg" which represents it's genres' top distribution over family names


									p.resolved.forEach(a =>{util.familyFreq(a);})
									//p.resolved.forEach(a =>{a.familyAgg?{}:console.log("$",a)})

									// p.payloadResolved.forEach(playob=>{
									// 	p.resolved = p.resolved.concat(playob.db);
									// 	p.resolved = p.resolved.concat(playob.payload);
									// 	//todo: when lastlook is functional
									// 	//p.resolved = p.resolved.concat(playob.lastlook)
									// })
									//p.resolved = p.db.concat(p.payload)
								})

								//followed is just the difference
								stats.followed = playobsResolved.length - stats.created
								console.log(stats);

								//testing: trying to use this to pull favorite artist playlists
								//console.log("adding extra processing step");
								playobsResolved.forEach(p => {
									var apMap = {};
									p.tracks.forEach(t => {
										t.track.artists.forEach(a => {
											!(apMap[a.name]) ? apMap[a.name] = 1 : apMap[a.name] = apMap[a.name] + 1
										})
									});

									for (var key in apMap) {
										if (apMap[key] > 2) {
											//console.log("found a " + key + " focused playlist");
											//console.log(p.playlist.id);
										}
									}

									var arr = [];
									Object.entries(apMap).forEach(tup => {
										var r = {[tup[0]]: tup[1]};arr.push(r);
									});

									var sorted = _.orderBy(arr, function (r) {return Object.values(r)[0]},'desc');
									//console.log("$sorted",sorted);

									//todo: going to need to do some math here
									//1) just getting the top value won't do if there are several that are about equal
									//2) if there are several I need to somehow define like a 'relative max' or something?
								});

								//todo:
								 res.send({playlists:playobsResolved,stats:stats})
								//res.send(playobsResolved)
							})
						})
					}, e => { //resolveReturnArtists
						console.error(e);
					})
				}, e => {//resolvePlaylists
					console.error(e);
				})
			//testing: getUserPlaylists
		})
}
