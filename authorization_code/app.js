/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 *
 * sourced from:
 * https://github.com/spotify/web-api-auth-examples
 *
 * locate auth info @:
 * https://developer.spotify.com/my-applications
 *
 *
 */

var express = require('express'); // Express web server framework
var bodyParser = require('body-parser');
var app = express();

var request = require('request'); // "Request" library
var fs      = require('fs');

var songkick = require('./songkick.js');
var spotify_api = require('./spotify_api.js');
var db_mongo_api = require('./db_mongo_api.js');
var puppet = require('./puppet.js');


// var maxbody = configuration.requests.limit || "50mb";
app.use(bodyParser.json({
	inflate: false,
	limit: "50mb"
}));
app.use(bodyParser.urlencoded({
	extended: false,
	limit: "50mb"
}));

//todo: forget why this wasn't working

// for(let key in spotify_api){
//     let type = songkick[key]['type']
//     switch(type){
//         case 'POST':
//         {app.post("/"+key,songkick[key])
//         }break;
//         case 'GET':
//         {app.get("/"+key,songkick[key])
//         }break;
//         default:
//         {
//
//         }
//     }
//
// }

var port = 8888;

console.log('Listening on ' + port);
app.listen(port);


//=================================================
//utilities

var jstr = function(ob){
	return JSON.stringify(ob,null,4)
}

const colors = require('colors/safe');
console.error = function(msg){console.log(colors.red(msg))};
console.warn = function(msg){console.log(colors.yellow(msg))};
console.good = function(msg){console.log(colors.green(msg))};
console.info = function(msg){
	var linePrint = function(){
		let initiator = 'unknown place';
		try {
			throw new Error();
		} catch (e) {
			if (typeof e.stack === 'string') {
				let isFirst = true;
				for (const line of e.stack.split('\n')) {
					const matches = line.match(/^\s+at\s+(.*)/);
					if (matches) {
						if (!isFirst) { // first line - current function
							// second line - caller (what we are looking for)
							initiator = matches[1];
							break;
						}
						isFirst = false;
					}
				}
			}
		}
		var pat = new RegExp(/\\(?:.(?!\\))+$/)
		return pat.exec(initiator);
	};
	console.log('\x1b[36m%s\x1b[0m',msg + " " + linePrint())
};

//more strategic way of replacing console methods
var configureLogs = function(){
	['log', 'warn', 'error'].forEach((methodName) => {
		const originalMethod = console[methodName];
		console[methodName] = (...args) => {
			let initiator = 'unknown place';
			try {
				throw new Error();
			} catch (e) {
				if (typeof e.stack === 'string') {
					let isFirst = true;
					for (const line of e.stack.split('\n')) {
						const matches = line.match(/^\s+at\s+(.*)/);
						if (matches) {
							if (!isFirst) { // first line - current function
								// second line - caller (what we are looking for)
								initiator = matches[1];
								break;
							}
							isFirst = false;
						}
					}
				}
			}
			var pat = new RegExp(/\\(?:.(?!\\))+$/)
			var lineOut = pat.exec(initiator);
			//negative lookahead
			//console.log( lineOut[0]);
			originalMethod.apply(console, [...args, '\n', lineOut[0]]);

		};
	});
}
//configureLogs();

console.log("colors configured");
console.info("console.info configured with line output");

module.exports.jstr = jstr;
module.exports.console = console;

//=================================================
//endpoints

console.log("available endpoints:");
for(var key in spotify_api) {
	// if(spotify_api[key] instanceof Function && spotify_api[key].length === 3) {
		console.log(key);
		app.post("/" + key, spotify_api[key]);
}

//
// app.post('/getFollowedArtists', function(req, res) {
// 	spotify_api.getFollowedArtists().then(function(res2){
// 		res.send(res2)
// 	})
// });
// app.post('/getTopArtists', function(req, res) {
// 	spotify_api.getTopArtists().then(function(res2){
// 		res.send(res2)
// 	})
// });
//
// app.post('/resolvePlaylists', function(req, res) {
// 	spotify_api.resolvePlaylists(req).then(function(res2){
// 		res.send(res2)
// 	})
// });

app.post('/getMetroEvents', function(req, res) {
	db_mongo_api.fetch(req,res).then(function(res2){
		res.send(res2)
	})
});

app.post('/fetchMetroEvents', function(req, res) {

	var date30 = new Date();
	date30.setDate(date30.getDate() + 30);
	req.body = {
		metro:{"displayName":"Columbus", "id":9480},
		dateFilter:{"start": new Date().toString(),"end":date30.toString()}
	};
	songkick.fetchMetroEvents(req,res).then(function(res2){
		res.send(res2)
	})
});

app.post('/resolveEvents', function(req, res) {
	songkick.resolveEvents(req).then(function(res2){
		res.send(res2)
	})
});



//testing

app.post('/puppet', function(req, res) {
	puppet.puppet(req).then(function(res2){
		res.send(res2)
	})
});

//todo: trying to read from my tplink access point
//this is probably a shitty idea anyways just b/c its secured = probably not going to be able to crawl it?

//#widget--fa9fb31d-1134-3bd0-f9cf-593807f45e41 > div.widget-wrap-outer.text-wrap-outer > div.widget-wrap.text-wrap > span.text-wrap-display
// var rp = require('request-promise');
// let options = {
// 	uri: "http://192.168.68.1/webpages/index.html#networkStatus",
// };
app.post('/afraid', function(req, res) {
	rp(options).then(r =>{
		res.send(r)
	},e =>{
		res.send(e)
	})
});


//==========================================================================================
// SPOTIFY oAUTH 2 (with node library)
// https://developer.spotify.com/documentation/general/guides/authorization-guide/
// https://www.npmjs.com/package/client-oauth2

var rp = require('request-promise');
let all_scopes = ["playlist-read-private", "playlist-modify-private", "playlist-modify-public", "playlist-read-collaborative", "user-modify-playback-state", "user-read-currently-playing", "user-read-playback-state", "user-top-read", "user-read-recently-played", "app-remote-control", "streaming", "user-read-birthdate", "user-read-email", "user-read-private", "user-follow-read", "user-follow-modify", "user-library-modify", "user-library-read"];

var ClientOAuth2 = require('client-oauth2')
var client_id = '178a441343904c588cef9acf8165a5d4'; // Your client id
var client_secret = '1c09323e0aad42cfaef5f23bb08b6428'; // Your secret

var spotifyClientAuth = new ClientOAuth2({
	clientId: client_id,
	clientSecret: client_secret,
	accessTokenUri: 'https://accounts.spotify.com/api/token',
	authorizationUri: 'https://accounts.spotify.com/authorize',
	redirectUri: 'http://localhost:8888/callback',
	scopes: all_scopes
})

var global_refresh = "AQCigbmzot5h6PcEL9XuWX508gtwGJUWzIPwc4N-TwvjoJho6Zj_5Vv6N_4yP1nl-nOi0OS7KxGp716EciKNno0Q-88sCUlMvTdCqE2CMMJT9kfUeo8onI29LLS-lCXkUvY";
var global_access_token = "";
app.get('/login', function (req, res) {
	var uri = spotifyClientAuth.code.getUri()
	res.redirect(uri)
})

var testPrivate=  function(){
    return new Promise(function(done, fail) {
			var auth = 'Bearer '  + global_access_token;
			console.log("testPrivate token:",global_access_token);
			let options = {
				method: "PUT",
				uri: 'https://api.spotify.com/v1/playlists/4OC9p2TkyKnxgDrzodRq3B',
				body:"{\"name\":\"private_control\",\"description\":\"Updated:" + new Date().toISOString() + "\",\"public\":false}",
				headers: {
					'Authorization': auth
				}
			};
			rp(options).then(function (res) {
				//doesn't have a response
				console.log("testPrivate success");
				done();
			}).catch(function (err) {
				console.log(err);
				fail(err);
			})
    })
}

app.get('/callback', function (req, res) {
	spotifyClientAuth.code.getToken(req.originalUrl)
		.then(function (user) {
			console.log("new token:",user.accessToken);
			console.log("new refresh token:",user.refreshToken);
			global_access_token = user.accessToken;
			//console.log("$callback",user.data) //=> { accessToken: '...', tokenType: 'bearer', ... }

			//testing: newly minted auth
			// testPrivate(user).then(r =>{
			// 	console.log("done!");
			// });

			//testing: newly minted auth, call refresh, test with new token
			// async function testRefresh() {
			// 	await testPrivate()
			// 	await timed()
			// 	await testPrivate()
			// }
			// testRefresh().then(r =>{
			// 	console.log("done!");
			// });

			//depreciated: don't remember exactly what this was all about
			//user object has a method called refresh and sign?

			// Refresh the current users access token.
			// user.refresh().then(function (updatedUser) {
			// 	console.log(updatedUser !== user) //=> true
			// 	console.log(updatedUser.accessToken)
			// })

			// Sign API requests on behalf of the current user.
			// user.sign({
			// 	method: 'get',
			// 	url: 'https://github.com/fbegue/Showcase'
			// })

			// We should store the token into a database.
			return res.send(user.accessToken)
		})
});

//todo:
var timed =  function(){
	return new Promise(function(done, fail) {
		setTimeout(t =>{
			console.log("trying to refresh...");
			refresh("<TOKEN>")
				.then(r =>{
					done();
				});
		},3000)
	})
};

//testing:
//my refresh is always good now
//timed({data:{refresh_token:global_refresh}})


var refresh =  function(refresh_token){
    return new Promise(function(done, fail) {
		var authOptions = {
			method:"POST",
			url: 'https://accounts.spotify.com/api/token',
			headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
			form: {
				grant_type: 'refresh_token',
				refresh_token: refresh_token
			},
			json: true
		};

		rp(authOptions).then(function (res) {
			global_access_token = res.access_token;
			console.log("new global_access_token from refresh",global_access_token);
			done();
		}).catch(function (err) {
			console.log(err.error);
			fail(err);
		})
    })
}


//testing:

//depreciated
//attempt at using SpotifyWebApi to do this
//feels like at some point I had a manually-extracted return code working like it says below
//but that stopped working or I misunderstood something?
//either way never understood how to do it completely programmatically, and left it for permanent refresh token dealio

var scopes =  ['user-read-private', 'user-read-email'];
var spotifyApi = {};

var doUserAuth = function () {

	var spotifyApi = new SpotifyWebApi({
		redirectUri: redirectUri,
		clientId: clientId,
		clientSecret:clientSecret
	});

	//var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, true);
	//hitting this address gives back some kind of code?
	//but the code that's returned as a query parameter to the redirect URI is what we want - what is the purpose of the one in the body?

	//todo: but of course this won't work continually b/c it needs refreshed?
	// or its just good after this initial login, b/c we have a refresh mechanism?
	//console.log(authorizeURL);
	var code = "AQDtXS-ysXQPiAtSJ5Ie-uhLben03f8j_yM1H8G-08j7jxCJQwC1_Bb_9ID-0MKKPSmA5oaWtBhI7boBmKaPC7A2hX-MNWKtpjlN76TDhjYV2wMB7BIUfQQKTlfe_HHDK3CVp84AN4j9pnJsQ3GFUqk54taIsM54Y4MGTR0-uRFyxfYx50MCB6x4M1vT3R5A81mWSBABvfmS4VsidTyhc8wIc48Yxw"

	//had trouble programmatically retrieving that code

	// var getCode = function (authorizeURL) {
	// 	return new Promise(function (done, fail) {
	// 		let options = {
	// 			method: "GET",
	// 			uri: authorizeURL,
	// 		};
	// 		rp(options).then(function (res) {
	// 			console.log("authorizeURL res", res);
	// 		}).catch(function (err) {
	// 			console.log(err);
	// 		})
	// 	})
	// };
	//
	// getCode(authorizeURL)
	// 	.then(function (res) {
	// 		console.log("authorizeURL res", res)
	// 	})
	// 	.catch(function (err) {
	// 		console.log(err);
	// 	});

	//todo: { [WebapiError: Bad Request] name: 'WebapiError', message: 'Bad Request', statusCode: 400 }

	spotifyApi.authorizationCodeGrant(code).then(
		function(data) {
			console.log('The token expires in ' + data.body['expires_in']);
			console.log('The access token is ' + data.body['access_token']);
			console.log('The refresh token is ' + data.body['refresh_token']);

			// Set the access token on the API object to use it in later calls
			spotifyApi.setAccessToken(data.body['access_token']);
			spotifyApi.setRefreshToken(data.body['refresh_token']);
		},
		function(err) {
			console.log('Something went wrong!', err);
		}
	);

}

//==========================================================================================
//BEGIN SPOTIFY AUTH SECTION (their example code)


// var querystring = require('querystring');
// var cookieParser = require('cookie-parser');
//
// var client_id = '178a441343904c588cef9acf8165a5d4'; // Your client id
// var client_secret = '1c09323e0aad42cfaef5f23bb08b6428'; // Your secret
// var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
//
// var refresh_token_global = {}
// var access_token_global = {};
//
// /**
//  * Generates a random string containing numbers and letters
//  * @param  {number} length The length of the string
//  * @return {string} The generated string
//  */
// var generateRandomString = function(length) {
// 	var text = '';
// 	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//
// 	for (var i = 0; i < length; i++) {
// 		text += possible.charAt(Math.floor(Math.random() * possible.length));
// 	}
// 	return text;
// };
//
// var stateKey = 'spotify_auth_state';
//
//
// app.use(express.static(__dirname + '/public'))
// 	.use(cookieParser());
//
// app.get('/login', function(req, res) {
//
// 	var state = generateRandomString(16);
// 	res.cookie(stateKey, state);
//
//
// 	//todo: scope requested gives certain permissions for your application's requests
// 	//the permissions required change depending on the endpoint you're hitting
//
// 	//hit 'get token' on any dev console test page, and the page will tell you
// 	//what permissions are required for that endpoint.
//
// 	// https://beta.developer.spotify.com/console/get-current-user-top-artists-and-tracks/?type=artists&time_range=&limit=&offset=
//
// 	// /v1/me/playlists : playlist-read-private, playlist-read-collaborative
// 	// /v1/me/top/{type} : user-top-read
//
// 	// your application requests authorization
//
// 	res.redirect('https://accounts.spotify.com/authorize?' +
// 		querystring.stringify({
// 			response_type: 'code',
// 			client_id: client_id,
// 			scope: scope,
// 			redirect_uri: redirect_uri,
// 			state: state
// 		}));
// });
//
// let all_scopes =["playlist-read-private", "playlist-modify-private", "playlist-modify-public", "playlist-read-collaborative", "user-modify-playback-state", "user-read-currently-playing", "user-read-playback-state", "user-top-read", "user-read-recently-played", "app-remote-control", "streaming", "user-read-birthdate", "user-read-email", "user-read-private", "user-follow-read", "user-follow-modify", "user-library-modify", "user-library-read"];
// let all_scopes_str = "playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative user-modify-playback-state user-read-currently-playing user-read-playback-state user-top-read user-read-recently-played app-remote-control streaming user-read-birthdate user-read-email user-read-private user-follow-read user-follow-modify user-library-modify user-library-read";
// //var scope = 'user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative';
// let scope = all_scopes_str;
//
// app.get('/callback', function(req, res) {
//
// 	console.log("callback!");
//
// 	// your application requests refresh and access tokens
// 	// after checking the state parameter
//
// 	var code = req.query.code || null;
// 	var state = req.query.state || null;
// 	var storedState = req.cookies ? req.cookies[stateKey] : null;
//
// 	if (state === null || state !== storedState) {
// 		res.redirect('/#' +
// 			querystring.stringify({
// 				error: 'state_mismatch'
// 			}));
// 	} else {
// 		res.clearCookie(stateKey);
// 		var authOptions = {
// 			url: 'https://accounts.spotify.com/api/token',
// 			form: {
// 				code: code,
// 				redirect_uri: redirect_uri,
// 				grant_type: 'authorization_code',
// 				scope:scope
// 			},
// 			headers: {
// 				'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
// 			},
// 			json: true
// 		};
//
// 		request.post(authOptions, function(error, response, body) {
// 			if (!error && response.statusCode === 200) {
//
// 				var access_token = body.access_token,
// 					refresh_token = body.refresh_token;
//
// 				access_token_global = access_token;
// 				refresh_token_global = refresh_token;
//
// 				//console.log("dosearch.doSearch");
// 				//dosearch(access_token,function(){console.log("test callback");})
//
// 				var options = {
// 					url: 'https://api.spotify.com/v1/me',
// 					headers: { 'Authorization': 'Bearer ' + access_token },
// 					json: true
// 				};
//
// 				// use the access token to access the Spotify Web API
// 				request.get(options, function(error, response, body) {
// 					console.log(body);
// 				});
//
//
// 				// we can also pass the token to the browser to make requests from there
// 				res.redirect('/#' +
// 					querystring.stringify({
// 						access_token: access_token,
// 						refresh_token: refresh_token
// 					}));
// 			} else {
// 				res.redirect('/#' +
// 					querystring.stringify({
// 						error: 'invalid_token'
// 					}));
// 			}
// 		});
// 	}
// });
//
// app.get('/getToken', function(req, res) {
// 	res.send({
// 		'access_token': access_token_global
// 	});
// });
//
// app.get('/refresh_token', function(req, res) {
//
// 	console.log("/refresh_token");
//
// 	// requesting access token from refresh token
// 	var refresh_token = req.query.refresh_token;
// 	var authOptions = {
// 		url: 'https://accounts.spotify.com/api/token',
// 		headers: {'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))},
// 		form: {
// 			grant_type: 'refresh_token',
// 			refresh_token: refresh_token
// 		},
// 		json: true
// 	};
//
// 	request.post(authOptions, function (error, response, body) {
// 		if (!error && response.statusCode === 200) {
// 			var access_token = body.access_token;
// 			access_token_global = access_token;
// 			res.send({
// 				'access_token': access_token
// 			});
// 		}
// 	});
//
// });








