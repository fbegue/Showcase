var SpotifyWebApi = require('spotify-web-api-node'); // Express web server framework

var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');

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


var token = "BQAITxzn04auphvTheFcRvlj19gx9na9q_G5wDQDiYXOs7MASaouJryANWXUVOH0gx-Ci82E1XVZXksrPEa-K_5KhKMB1xYvoystGYVyTQ9y_0l6YyDunAhSSCr77-c4HZIy5Bhp9AWNbqNfeN1zUtCy8HQqy_nn5h7XOCmrbw9kZwgVBg3GjXKT85H-rMJuijXdQbXlD2WZYakJKhuk1XanW28nhfVc22SreXpTcxtIqWajqxaMe8c3ld3kmZboXXg1qNVroY3Wm3e2AURY9h16ezQ"
spotifyApi.setAccessToken(token);


//=================================================
//methods

//https://github.com/thelinmichael/spotify-web-api-node


//todo: easier way to expose these?

//todo: hardcoded user name
module.exports.getUserPlaylists = function(){
    return new Promise(function(done, fail) {
	    spotifyApi.getUserPlaylists('dacandyman01')
		    .then(function(data) {
			    console.log('Retrieved playlists', data.body);
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

module.exports.playlist_tracks = function(req,res){
	return new Promise(function(done, fail) {
		console.log("playlist_tracks",JSON.stringify(req.body,null,4));
		console.log("playlist_tracks # of playlists to process:",req.body.playlists.length);
		let startDate = new Date();
		console.log("start time:",startDate);

		let url1 = "https://api.spotify.com/v1/playlists/";
		let url2 = "/tracks";
		let offset_base = 50;


		function getPages(options) {
			//console.log(options.uri);
			return rp(options).then(data => {
				//console.log("data",data.items.length);
				options.store = options.store.concat(data.items);
				//console.log("cacheIT",cacheIT[options.playlist_id].length);
				if (!(data.items.length === 50)){

					//todo: was thinking about working in creating my get_artists (for genres)
					//payloads as I go along here, but that will be a little complicated.

					return options;
				}
				else{
					options.offset = options.offset + offset_base ;
					options.uri =  options.url + "?fields=items.track(id,name,artists)&limit="+ options.limit + "&offset=" + options.offset;


					//todo: ideally I think it would be better if I knew how many total requests I was going to have to make
					//3x for this playlist, 24x for this, etc.
					//and then put those all in a promises array that I could manage the throttle more efficiently on
					//because right now my 'throttle' doesn't really know about these recursive getPages calls?
					//im guessing IDK really how that would work but it seems that would provide a performance advantage

					var wait =  function(ms){
						return new Promise(function(done, fail) {
							//console.log("waiting...");
							setTimeout(function(){
								//console.log("done!");
								done()
							},ms);
						})
					}

					return wait(300).then(function(){
						return getPages(options)
					})

					// return x();

				}
			});
		}

		//todo: test one
		//let t = JSON.parse(JSON.stringify(req.body.playlist));
		//req.body.playlist = {};
		////long 146
		//req.body.playlist = {id:"5vDmqTWcShNGe7ENaud90q"};
		////short 29
		//req.body.playlists = {id:"0sJK4pWqr7bnQ0fgxGmJrh"}
		////134
		//req.body.playlist = {id:"0fEQxXtJS7aTK4qrxznjAJ"}
		//console.log(JSON.stringify(req.body,null,4));

		let options = {
			uri: "",
			headers: {
				// 'User-Agent': 'Request-Promise',
				"Authorization":'Bearer ' + token
			},
			json: true
		};

		var promiseThrottle_playlists = new PromiseThrottle({
			requestsPerSecond: 5,
			//362
			// requestsPerSecond: 20,
			//124
			promiseImplementation: Promise  // the Promise library you are using
		});

		let promises = [];

		req.body.playlists.forEach(function(play){
			options = {
				uri: "",
				headers: {
					// 'User-Agent': 'Request-Promise',
					"Authorization":'Bearer ' + token
				},
				json: true,
			};

			options.url =  url1 + play.id + url2;
			options.offset = 0;
			options.limit = 50;
			options.uri = options.url + "?fields=items.track(id,name,artists)&limit=" + options.limit + "&offset=" + options.offset;
			options.playlist_id = play.id;
			options.store = [];
			promises.push(promiseThrottle_playlists.add(getPages.bind(this,options)));

		})


		Promise.all(promises).then(function(results){
			console.log("playlist_tracks finished execution:",Math.abs(new Date() - startDate) / 600);
			console.log("results ",results.length);
			//console.log("results ",results);

			let payloads = [];
			let payload = {};
			results.forEach(function(op){
				payload = {};
				payload.tracks = op.store;
				payload.playlist_id = op.playlist_id;
				payloads.push(payload)
			});
			console.log("FINISHED");
			done(payloads);
		})
	})//promise

};//playlist_tracks