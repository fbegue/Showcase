var SpotifyWebApi = require('spotify-web-api-node'); // Express web server framework

var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');

var resolver = require('./resolver.js');
let sql = require("mssql")
var db_api = require('./db_api.js');

var app = require('./app')

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

var clientSecret = '1c09323e0aad42cfaef5f23bb08b6428';

var scopes = all_scopes,
	redirectUri = 'http://localhost:8888/callback',
	clientId = '178a441343904c588cef9acf8165a5d4',
	//todo:
	state = 'some-state-of-my-choice';

var spotifyApi = {};

//user auth

var doUserAuth = function () {

	var spotifyApi = new SpotifyWebApi({
		redirectUri: redirectUri,
		clientId: clientId
	});

	var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, false);
	console.log(authorizeURL);

	//code retrieved when redirect URL is hit
	//todo: but of course this won't work b/c its not fresh?
	//how am i supposed to get this code to use?
	//var code = "AQD2iaFG76V-VEbJX-QaMeMiaIpw33iIrCrHSz95Pac2lXeprDnDUf3nTwjZPa1e5Q0UlG0NFX229Ly66T0Y5Q1rISE8uVGIqeUQoH3U6UAah7J79J0gtpZkdWOyoEpPrf9UBZz5BQq53H9lY0uwOzGZjlxj1d_492YMb-szXri0BKwcKDUUWWUSjc4ggKb78YKDeYzEpVc82jDwSJHILO-tUeg9T88ySqpYJhuOi8ObVyOrF9DZyrqAsQJy_wNTsO3LRtlJkYm2zK8XkFXriZu_H434ZzoP9abe3ETVUDP84zy2JywuOZ0HZf8vwPdsgIlL6OE-hbdK6YVpp-kYq2S0Io4H7dfDcsLyvojZDDJ0r4ZiyF48vWly3nNL0u81_myExgzVvryWP98O2fTeXEeNkrB6vl2wdp2NzzmUxvvEDgPDchGty7t4n4oYyW6-d0bmMFxiJDS03qiwtywhOtu-0qUKD7ViH4inhxpgwkuo2N6Hk4-zjWl6jlst3R9RD2kj9Pzmzgj9QSTOpjRVVU1FnX5SoRQGQDLDqpIV9i0rB29GJE9BC0DzZ_MQusC-FKN1odMLcAFcd0MKx5pMkpey21NgYOz0czxTVmITkBzK2Xh0ZrCKRvboq7YFccumDucpaojErLxQGxlX1TKyq1DSq05mYcXAnHc1G-9aHABeRe-8I43WZ4LKeDGymedRgBgY1d4aygOI0yJj";

	var getCode = function (authorizeURL) {
		return new Promise(function (done, fail) {
			let options = {
				method: "GET",
				uri: authorizeURL,
			};
			rp(options).then(function (res) {
				console.log("authorizeURL res", res);
			}).catch(function (err) {
				console.log(err);
			})
		})
	};

	getCode(authorizeURL)
		.then(function (res) {
			console.log("authorizeURL res", res)
		})
		.catch(function (err) {
			console.log(err);
		});

}

//testing:
//doUserAuth()

//========================================
//Client Credential flow


var doAuth = function(){

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
doAuth()

setInterval( e=>{
	console.log("client refresh @ 60m interval");
	doAuth()
},3600*1000)

//=================================================
//methods

//https://github.com/thelinmichael/spotify-web-api-node

//todo: hardcoded user name
module.exports.getUserPlaylists = function () {
	return new Promise(function (done, fail) {

		//todo: limit's max = 50 but cut it here for speedier testing
		spotifyApi.getUserPlaylists('dacandyman01', {limit: 20})
			.then(function (data) {
				//console.log('Retrieved playlists', data.body);
				done(data.body)
			}, function (err) {
				console.log('Something went wrong!', err);
			});
	})
}


// spotifyApi.createPlaylist('spot_test1', { 'public' : false })
// 	.then(function(data) {
// 		console.log('Created playlist!');
// 	}, function(err) {
// 		console.log('Something went wrong!', err);
// 	});


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
//we're going to check the db
//first to see if we stored any genre info about an artist
//before asking spotify for genres on an artist

//todo: better name?
var resolveReturnArtists = function (playob) {
	return new Promise(function (done, fail) {
		console.log("getArtists:", playob.artists.length);
		db_api.checkDBForArtistGenres(playob)
			.then(
				r => {
					//looks like: {playlist:{},tracks:[],artists:[],payload:[],db:[],lastLook:[]}
					//entries found in the the db will be returned in db, and those that were't go on payload
					//therefore, payload.length + db.length = artists.length

					//todo: depending on length of payload might it be advantangous to return some of that data immediately?
					/// or maybe wait until I at least hit spotify first

					//todo: check that work is split

					// console.log("artists",r.artists.length);
					// console.log("payload",r.payload.length);
					// console.log("db population",r.db.length);

					//returns with a mutated playob
					if (r.payload.length) {
						return resolver.resolveArtists(r)
					} else {
						console.log("empty payload - skipping resolveArtists");
						var dummy = function (t) {
							return new Promise(function (done, fail) {
								done(t)
							})
						}
						return dummy(r)
					}
				},

				e => {
					console.error(e);
					fail(e);
				})

			.then(mutatedPlayob => {
				mutatedPlayob.payload && mutatedPlayob.payload.length ? console.log("payload", mutatedPlayob.payload.length) : {};
				mutatedPlayob.spotifyArtists && mutatedPlayob.spotifyArtists.length ? console.log("spotifyArtists", mutatedPlayob.spotifyArtists.length) : {}
				done(mutatedPlayob)
			})


	})
}


//this is a request from the UI after selecting playlists
//to have analyzed
module.exports.resolvePlaylists = function (req) {
	return new Promise(function (done, fail) {
		let startDate = new Date();
		console.log("resolvePlaylists start time:", startDate);

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

					//todo: trying to get these to come back as the same object
					console.log("==================================");
					console.log(playobs.length);
					//console.log("db population",playobs[0].db.length);
					//returns with a full artist object
					//console.log(playobs[0].db[0]);
					//console.log("spotifyArtists",playobs[1].spotifyArtists.length);
					//console.log(playobs[1].spotifyArtists[1]);

					//todo: trying to speed up n^n op here
					//sure theres a better solution tho - this whole 'mutate the repo thing'
					//will probably get old at some point but for testing the steps, its nice

					var artGenMap = {};

					//little hairy here dealing with the two valid response types

					//todo: skipping spotify artists we couldn't find genres for
					playobs.forEach(agr => {
						if (agr.spotifyArtists) {
							agr.spotifyArtists.forEach(artGen => {
								if (artGen.genres.length) {
									artGenMap[artGen.id] = artGen.genres
								}
							});
						}
					});

					//todo: hol'up
					//this doesn't make any sense - we're just going to mutate with genre NAMES here
					//we need to commit these to db to get genre ids before this mutation is useful
					//instead we'll handle this in commitPlayobs

					//console.log("artGenMap",artGenMap);
					//artists is our data repo - here we mutate it with results we fetched elsewhere
					// playobs.forEach(function(p){
					// 	p.artists.forEach(function(a){
					// 		a.genres = artGenMap[a.id]
					// 		a.genres === undefined ? console.log(app.jstr(a)):{};
					// 	})
					// });

					//todo: this could probably be done faster by combining with some other set
					//concerned about sql operations - purely for information gathering - acting as a bottleneck
					//outside of getting ids for existing/new genres, I guess everything else could wait?

					//our db entries have fully qualified genres - just send'em back

					//todo: dunno what happened here exactly

					//console.log(p == JSON.stringify({}));
					var p = JSON.stringify(artGenMap);
					if (p === JSON.stringify({})) {
						console.log("no spotifyArtists to commit");
						done(playobs)
					}
						//commit new data to sql
						//commitPlayobs will return with fully qualified artists and genres we commited to db
					//and will rebind to return payload here
					else {
						//todo: made this a little more specific - only commits playob.spotifyArtists now
						//might not be a great move
						var pullPromises = [];
						db_api.commitPlayobs(playobs).then(function (justGetFromDb) {
							playobs.forEach(p => {
								pullPromises.push(db_api.checkDBForArtistGenres(p))
							});
							Promise.all(pullPromises).then(playobsResolved => {
								//console.log(app.jstr(playObsWithSpotifyArtists));
								console.log("resolvePlaylists finished execution:", Math.abs(new Date() - startDate) / 600);

								//genres have ids on them now
								//finally mutate the orignal request with fully qualified genres

								//todo: eh this is fucked
								//I'm really not deciding what any of the db objects consistently mean
								//sometimes I treat artists like an immutable source of truth for which
								//all the other playob properties form from

								//here I'm going to mutate it to be the final aggregation of db + spotifyArtists
								playobsResolved.forEach(p => {
									p.artists = [];
									p.artists = p.artists.concat(p.db)
									p.artists = p.artists.concat(p.spotifyArtists)
								})

								done(playobsResolved)
							})
						})
					}
				}, e => {
					console.error(e);
				})
			}, e => {
				console.error(e);
			})
	})
	//testing: getUserPlaylists
	//})
}


module.exports.searchArtist = function (artist) {
	return new Promise(function (done, fail) {
		//console.log(query);
		spotifyApi.searchArtists(artist.name)
			.then(function (r) {
				done({artist: artist, result: r})
			}, function (err) {
				console.error(err);
				fail(err);
			});
	})
};
