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

var clientSecret = 'a00084c5c193478e9fc5d9a0c0e70058';

var scopes = all_scopes,
	redirectUri = 'http://localhost:8888/callback',
	clientId = '0e7ef13646c9410293a0119e652b35f7',
	//todo:
	state = 'some-state-of-my-choice';

var spotifyApi = {};


//todo: hook up infinite refreshable one from app.js
var doUserAuth = function(){
	var credentials = {
		clientId: clientId,
		clientSecret: clientSecret,
		redirectUri:"cheat"
	};
	spotifyApi = new SpotifyWebApi(credentials);
	var temp ="BQDnNmzbjgZ3dHizRV3HCmTOSbpEzttOa2Avsz4963TcEIasL9wUAr1_O5AaG5cJ9L0z707UDFJHZGxHtEM1rAgfQM3742m0jkxCYSzLZ_01joNuUmceMJah9PUjDdsjKlWqElGG52hIOUy3rhcqZFLT5yUmsR_G9xfeFaR3rSNhl6uGhQB5aN5zCsjFOnl3y-kmnMD7wT0P6REvrn5e7UrVNzgdt57A5VGSpXdJyi72aXqi9o7exBl2poatou6xyFf4mTZNQQfZHXNpgh-QgLxN4M8";
	spotifyApi.setAccessToken(temp);
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
module.exports.getFollowedArtists =  function(){
    return new Promise(function(done, fail) {
    	//{ limit : 1 }
		spotifyApi.getFollowedArtists()
			.then(function(data) {
				// 'This user is following 1051 artists!'
				console.log('This user is following ', data.body.artists.total, ' artists!');
				done(data.body)
			}, function(err) {
				console.log('Something went wrong!', err);
				fail(err);
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
module.exports.resolvePlaylists = function (req) {
	return new Promise(function (done, fail) {
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
						resolverPromises.push(resolver.resolveArtists(playob))
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
						//todo: skipping spotify artists we couldn't find genres for
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
									done(playobsResolved)
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
