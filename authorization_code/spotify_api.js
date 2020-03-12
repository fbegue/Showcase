var SpotifyWebApi = require('spotify-web-api-node'); // Express web server framework

var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');

var resolver = require('./resolver.js');
let sql = require("mssql")
var db_api = require('./db_api.js');

var app =  require('./app')

//========================================
//db setup

const { poolPromise } = require('./db.js');
poolPromise.then(function(newPool) {
	module.exports.poolGlobal = newPool;
	var sreq = new sql.Request(newPool);
	sreq.query("select getdate();")
		.then(function(res){
			console.log("sql test:",res);
		})
});


//========================================
//spotify api setup

let all_scopes =["playlist-read-private", "playlist-modify-private", "playlist-modify-public", "playlist-read-collaborative", "user-modify-playback-state", "user-read-currently-playing", "user-read-playback-state", "user-top-read", "user-read-recently-played", "app-remote-control", "streaming", "user-read-birthdate", "user-read-email", "user-read-private", "user-follow-read", "user-follow-modify", "user-library-modify", "user-library-read"];

var clientSecret = '1c09323e0aad42cfaef5f23bb08b6428';

var scopes = all_scopes,
	redirectUri = 'http://localhost:8888/callback',
	clientId = '178a441343904c588cef9acf8165a5d4',
	//todo:
	state = 'some-state-of-my-choice';

// var spotifyApi = new SpotifyWebApi({
// 	redirectUri: redirectUri,
// 	clientId: clientId
// });
//
// var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
// console.log(authorizeURL);

//code retrieved when redirect URL is hit
//todo: but of course this won't work b/c its not fresh?
//how am i supposed to get this code to use?

//var code = "AQD2iaFG76V-VEbJX-QaMeMiaIpw33iIrCrHSz95Pac2lXeprDnDUf3nTwjZPa1e5Q0UlG0NFX229Ly66T0Y5Q1rISE8uVGIqeUQoH3U6UAah7J79J0gtpZkdWOyoEpPrf9UBZz5BQq53H9lY0uwOzGZjlxj1d_492YMb-szXri0BKwcKDUUWWUSjc4ggKb78YKDeYzEpVc82jDwSJHILO-tUeg9T88ySqpYJhuOi8ObVyOrF9DZyrqAsQJy_wNTsO3LRtlJkYm2zK8XkFXriZu_H434ZzoP9abe3ETVUDP84zy2JywuOZ0HZf8vwPdsgIlL6OE-hbdK6YVpp-kYq2S0Io4H7dfDcsLyvojZDDJ0r4ZiyF48vWly3nNL0u81_myExgzVvryWP98O2fTeXEeNkrB6vl2wdp2NzzmUxvvEDgPDchGty7t4n4oYyW6-d0bmMFxiJDS03qiwtywhOtu-0qUKD7ViH4inhxpgwkuo2N6Hk4-zjWl6jlst3R9RD2kj9Pzmzgj9QSTOpjRVVU1FnX5SoRQGQDLDqpIV9i0rB29GJE9BC0DzZ_MQusC-FKN1odMLcAFcd0MKx5pMkpey21NgYOz0czxTVmITkBzK2Xh0ZrCKRvboq7YFccumDucpaojErLxQGxlX1TKyq1DSq05mYcXAnHc1G-9aHABeRe-8I43WZ4LKeDGymedRgBgY1d4aygOI0yJj";

// var getCode =  function(authorizeURL){
// 	return new Promise(function(done, fail) {
// 		let options = {
// 			method:"GET",
// 			uri: authorizeURL,
// 		};
// 		rp(options).then(function(res){
// 			console.log("authorizeURL res",res);
// 		}).catch(function(err){
// 			console.log(err);
// 		})
// 	})
// };
//
// getCode(authorizeURL)
// 	.then(function(res){
// 	console.log("authorizeURL res",res)})
// 	.catch(function(err){
// 		console.log(err);
// 	});

// var credentials = {
// 	clientId: clientId,
// 	clientSecret: clientSecret,
// 	redirectUri: redirectUri
// };
//
// var spotifyApi = new SpotifyWebApi(credentials);
//
// // Retrieve an access token and a refresh token
// spotifyApi.authorizationCodeGrant(code).then(
// 	function(data) {
// 		console.log('The token expires in ' + data.body['expires_in']);
// 		console.log('The access token is ' + data.body['access_token']);
// 		console.log('The refresh token is ' + data.body['refresh_token']);
//
// 		// Set the access token on the API object to use it in later calls
// 		spotifyApi.setAccessToken(data.body['access_token']);
// 		spotifyApi.setRefreshToken(data.body['refresh_token']);
//
// 		// spotifyApi.getUserPlaylists('dacandyman01')
// 		// 	.then(function(data) {
// 		// 		console.log('Retrieved playlists', data.body);
// 		// 	},function(err) {
// 		// 		console.log('Something went wrong!', err);
// 		// 	});
//
// 	},
// 	function(err) {
// 		console.log('Something went wrong!', err);
// 	}
// );


//========================================
//Client Credential flow

var spotifyApi = new SpotifyWebApi({
	clientId: clientId,
	clientSecret: clientSecret,
	redirectUri: redirectUri
});


var token = "BQD-Ng2Y35UfdXKrL7WqI5mAGT-ozpSCRZxtPeA2iQ-d-WOHkL1NBrr5xF2a2TA0PEy65L8gr_dBLsoK-kk8FrSJn7DKnpdc8ZFfRKcDBPx0VYNXD0BSkl4FzuVTOQvIuYeY9Zq-_zGHvzOGjAKkoZYWMlB0Mze-rdq5lH1OTY6jlExnslXh2e8_hhY0a6FQuGZ6pu4F0Rp2c8YqbtKI85WdCsGjyUom8RWggnvQj95BjOpK4WBEml077G83KRGN4E5r5xXD5mBZr_ibbSSkyRzPZR0"
spotifyApi.setAccessToken(token);
module.exports.token = token;


//=================================================
//methods

//https://github.com/thelinmichael/spotify-web-api-node

//todo: hardcoded user name
module.exports.getUserPlaylists = function(){
	return new Promise(function(done, fail) {

		//todo: limit's max = 50 but cut it here for speedier testing
		spotifyApi.getUserPlaylists('dacandyman01',{limit:20})
			.then(function(data) {
				//console.log('Retrieved playlists', data.body);
				done(data.body)
			},function(err) {
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
var getArtists = function(playob){
	return new Promise(function(done, fail) {
		//console.log("#len",playob.artists.length);
		db_api.checkDBForArtistGenres(playob)
			.then(
				r =>{
					//looks like: {playlist:{},tracks:[],artists:[],payload:[],db:[],lastLook:[]}
					//console.log("checkDBForArtistGenres produced payload:",r.payload.length);

					//todo: depending on length of payload might it be advantangous to return some
					//of that data immediately? or maybe wait until I at least hit spotify first

					//payload means move onto next resolver
					//todo: ignoring db results
					if(r.payload.length){return resolver.resolveArtists(r.payload)}

					//todo:
					else{console.log("empty payload");r.flag = true;done(r)}},

				e =>{console.error(e);fail(e);})

			.then(artGenTuples => {
				//console.log("artGenTuples",artGenTuples.length);
				done(artGenTuples)
			})


	})
}


//this is a request from the UI after selecting playlists
//to have analyzed
module.exports.resolvePlaylists =  function(req){
	return new Promise(function(done, fail) {
		req.body.playlists = JSON.parse(req.body.playlists);
		console.log("req.body.playlists",req.body.playlists);

		//resolver.resolvePlaylists(req.body.playlists)
		//testing: fake UI request by just getting my own
		//currently limited to 20 for faster

		module.exports.getUserPlaylists().then(r => {
			var plays = [];
			r.items.forEach(function (i) {
				plays.push(i)
			})
			req.body.playlists = plays;

			//testing: just 2 of them
			var playsr = [];
			playsr.push(plays[0]);
			playsr.push(plays[1]);
			req.body.playlists = playsr;

		}).then(q => {
			resolver.resolvePlaylists(req.body.playlists)
				.then(playobs =>{

					//unwind artists from tracks and attach them to each playob
					playobs.forEach(function(playob){
						playob.map = {};
						playob.artists = [];
						playob.tracks.forEach(t => {
							t.track.artists.forEach(a => {
								playob.map[a.id] = a;
							})
						})
						for (var key in playob.map){playob.artists.push(playob.map[key]) }
					});

					//now every playob looks like: {playlist:{},tracks:[],artists:[]}
					//console.log(app.jstr(playobs));

					var promises = [];
					playobs.forEach(function(playob){
						promises.push(getArtists(playob))
					})

					//todo: bad code design in getArtists
					//so getArtists will short circuit with the playobs
					//on an empty payload - it has two return signatures which is meh

					Promise.all(promises).then(artGenArrays => {

						//artGens length = number of playlists
						//make a big map of all of them
						//console.log("artGens",artGenArrays.length);
						// console.log(app.jstr(artGen));

						// console.log("$test",artGenArrays[0][0]);

						var artGenMap = {};
						artGenArrays.forEach(agr =>{
							agr.forEach(artGen =>{
								artGenMap[artGen.id] = artGen.genres
							});
						});

						//console.log("artGenMap",artGenMap);

						playobs.forEach(function(p){
							p.artists.forEach(function(a){
								a.genres = artGenMap[a.id]
							})
						});

						//todo: this could probably be done faster by combining with some other set
						//concerned about sql operations - purely for information gathering - acting as a bottleneck
						//outside of getting ids for existing/new genres, I guess everything else could wait?

						//commit new data to sql
						db_api.commitPlayobs(playobs).then(function(playobs2){

							//genres have ids on them now
							done(playobs2)
						})

					},e =>{
						console.error(e);
					})

				},e =>{
					console.error(e);
				})
		})
	})
}


module.exports.searchArtist  =  function(query){
    return new Promise(function(done, fail) {
	    console.log(query);
	    spotifyApi.searchArtists(query.name)
		    .then(function(r) {
			    done({query:query,result:r})
		    }, function(err) {
			    console.error(err);
			    fail(err);
		    });
    })
};
