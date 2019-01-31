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
var app = express();

var request = require('request'); // "Request" library
var fs      = require('fs');

//register songkick module.exports as routes

var songkick = require('./songkick.js');
for(let key in songkick){
	app.post("/"+key,songkick[key]);
}


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



//todo:
//trying to export from here and grab in broswer, but can't load
//var exports = {refresh_token_global:refresh_token_global,access_token_global:access_token_global}

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

// app.get('/test', function(req, res) {
//
// 	console.log("testing spotify.js");
// 	req.token = access_token_global;
// 	req.query = "queryTest"
// 	spotify.search_artists(req).then(function(result){
//
// 		console.log("search_artists returns",result);
// 		res.send({"result":result})
//
// 	})
//
//
// });

// service.search_artists();

// app.get('/search_artists', function(req, res) {
//
// 	console.log("search_artists");
// 	service.search_artists().then(function(){
//
//
// 		 res.send({"search_artists":"testvalue"})
// 	})
//
// });


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

console.log('Listening on 8888');
app.listen(8888);


//==========================================================================================
//BEGIN SCRAPING SECTION

//basic cheerio setup
//https://github.com/scotch-io/node-web-scraper/blob/master/server.js



var cheerio = require('cheerio');

app.get('/scrape', function(req, res) {

    url = 'https://www.facebook.com/pg/skullysmusicdiner/events/?ref=page_internal/';
    //url = 'http://www.imdb.com/title/tt1229340/';

    // require("jsdom").env("", function(err, window) {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }
    //
    //     var $ = require("jquery")(window);
    // });



    request(url, function(error, response, html){
        if(!error){

           // var $ = cheerio.load(html);



            var file = {}
           // var path = "C:\\Users\\begue.16\\WebstormProjects\\playlistGen\\authorization_code\\facebook_events_skully.html"
           //  var path = "C:\\Users\\begue.16\\WebstormProjects\\playlistGen\\authorization_code\\facebook_events_skully_eventsOnly.html"
            var path = "C:\\Users\\begue.16\\WebstormProjects\\playlistGen\\authorization_code\\facebook_events_skully_divOnly.html"


            var loadit = function(){
                return new Promise(function(done, fail) {
                    console.log("loadit");
                    fs.readFile(path, function (err, data) {
                        if (err) {
                            console.log(err)
                        }
                        file = data;
                        // file =  '<div class="_4uly"> Upcoming Events </div>'
                        done()

                    });
                })
            }

            var scrape = function(){
                return new Promise(function(done, fail) {

                    console.log("scrape");
                    console.log(file);

                    //todo: when I set this above in file as a test, it doesn't pass thru????

                    file =  '<div class="_4uly"> Upcoming Events </div>'

                    const jsdom = require("jsdom");
                    //const static_fb = require("./authorization_code/facebook_events_skully.html");
                    const { JSDOM } = jsdom;
                    // const { window } = new JSDOM(html);
                    const { window } = new JSDOM(file);
                    const $ = require('jQuery')(window);

                    // $('<div>Upcoming Events</div>').appendTo('body');
                    // console.log($('h1').text());

                    var found = $('div:contains("Upcoming Events")')
                    //var found = $('div:contains("Hello")')
                    console.log(found[0].outerHTML);
                    console.log($(found)[0].outerHTML);
                    done()


                })
            }

            loadit()
                .then(scrape(file))
                .catch(function(e){
                    console.log("well shit");
                    console.log(e);
                });






        }

        // fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
        //     console.log('File successfully written! - Check your project directory for the output.json file');
        // })

        res.send('Check your console!')
    })
})







//==========================================================================================
//BEGIN FUCKING AROUND TRYING TO USE AJAX IN NODE??? IDK MAN

var word = "TEST"
var url = 'https://api.spotify.com/v1/search?type=track&limit=50&q=' + encodeURIComponent('track:"'+word+'"');

//console.log("testajax");


// var $ = {};
//
// var testajax = function(){
//   console.log("testajax");
//   var root = 'https://jsonplaceholder.typicode.com';
//
//   var url = root + '/posts/1'
//
//   try{
//     $.ajax(url, {
//       dataType: 'json',
//       success: function(res) {
//         console.log("success");
//         console.log(res);
//       }
//     })
//
//   }catch(e){
//     console.log(e);
//   }
// }
//
// var define$ = function() {
//
//   return new Promise(function (done, fail) {
//     require("jsdom/lib/old-api").env("", function (err, window) {
//       if (err) {console.error(err);fail(err)}
//
//       $ = require("jquery")(window);
//       console.log("$ defined..");
//       done();
//      // testajax();
//     });
//   })
// }
//
//
//
// define$().then(function(){
//
//   console.log("other stuff");
//
// })




