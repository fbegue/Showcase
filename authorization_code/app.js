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
console.log("colors configured");

//module.exports.console = console;
module.exports.jstr = jstr;

//=================================================
//endpoints

app.post('/getUserPlaylists', function(req, res) {
	spotify_api.getUserPlaylists().then(function(res2){
		res.send(res2)
	})
});

app.post('/resolvePlaylists', function(req, res) {
	spotify_api.resolvePlaylists(req).then(function(res2){
		res.send(res2)
	})
});

app.post('/getMetroEvents', function(req, res) {
	songkick.getMetroEvents(req,res).then(function(res2){
		res.send(res2)
	})
});

//test
app.post('/puppet', function(req, res) {
	puppet.puppet(req).then(function(res2){
		res.send(res2)
	})
});




//==========================================================================================
//BEGIN SPOTIFY AUTH SECTION

var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '178a441343904c588cef9acf8165a5d4'; // Your client id
var client_secret = '1c09323e0aad42cfaef5f23bb08b6428'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var refresh_token_global = {}
var access_token_global = {};

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var stateKey = 'spotify_auth_state';


app.use(express.static(__dirname + '/public'))
	.use(cookieParser());

app.get('/login', function(req, res) {

	var state = generateRandomString(16);
	res.cookie(stateKey, state);


	//todo: scope requested gives certain permissions for your application's requests
	//the permissions required change depending on the endpoint you're hitting

	//hit 'get token' on any dev console test page, and the page will tell you
	//what permissions are required for that endpoint.

	// https://beta.developer.spotify.com/console/get-current-user-top-artists-and-tracks/?type=artists&time_range=&limit=&offset=

	// /v1/me/playlists : playlist-read-private, playlist-read-collaborative
	// /v1/me/top/{type} : user-top-read

	// your application requests authorization

	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		}));
});

let all_scopes =["playlist-read-private", "playlist-modify-private", "playlist-modify-public", "playlist-read-collaborative", "user-modify-playback-state", "user-read-currently-playing", "user-read-playback-state", "user-top-read", "user-read-recently-played", "app-remote-control", "streaming", "user-read-birthdate", "user-read-email", "user-read-private", "user-follow-read", "user-follow-modify", "user-library-modify", "user-library-read"];
let all_scopes_str = "playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative user-modify-playback-state user-read-currently-playing user-read-playback-state user-top-read user-read-recently-played app-remote-control streaming user-read-birthdate user-read-email user-read-private user-follow-read user-follow-modify user-library-modify user-library-read";
//var scope = 'user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative';
let scope = all_scopes_str;

app.get('/callback', function(req, res) {

	console.log("callback!");

	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code',
				scope:scope
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {

				var access_token = body.access_token,
					refresh_token = body.refresh_token;

				access_token_global = access_token;
				refresh_token_global = refresh_token;

				//console.log("dosearch.doSearch");
				//dosearch(access_token,function(){console.log("test callback");})

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { 'Authorization': 'Bearer ' + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {
					console.log(body);
				});


				// we can also pass the token to the browser to make requests from there
				res.redirect('/#' +
					querystring.stringify({
						access_token: access_token,
						refresh_token: refresh_token
					}));
			} else {
				res.redirect('/#' +
					querystring.stringify({
						error: 'invalid_token'
					}));
			}
		});
	}
});

app.get('/getToken', function(req, res) {
	res.send({
		'access_token': access_token_global
	});
});

app.get('/refresh_token', function(req, res) {

	console.log("/refresh_token");

	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))},
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		},
		json: true
	};

	request.post(authOptions, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token;
			access_token_global = access_token;
			res.send({
				'access_token': access_token
			});
		}
	});

});








