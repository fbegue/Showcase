var request = require('request'); // "Request" library

//https://github.com/request/request#requestoptions-callback
var _request = function(req){
	return new Promise(function(done, fail) {

		console.log("--------------------------------------------");
		console.log("_request",req);

		request.get(req, function (error, response, body) {
			if (!error) {

				console.log("--------------------------------------------");
				console.log("error:",error);
				//console.log(response);
				console.log("--------------------------------------------");
				console.log("response:",response);

				// ("Authorization", 'Bearer ' + global_access_token);

				// var access_token = body.access_token;
				// access_token_global = access_token;
				// res.send({
				// 	'access_token': access_token
				// });

				done(body)
			}
			else{
				console.log("--------------------------------------------");
				console.log("_request error:",error);
			}
		});
	})
};

/**
 * Hit a search endpoint to try and resolve an input string to an artist profile in Spotify
 * @function playlist_tracks
 **/
exports.search_artists  = function(req){

	console.log("search_artists");

	return new Promise(function(done, fail) {

		console.log("incoming req:");
		console.log("token:",req.token);
		console.log("query:",req.query);

		//todo: test query
		//todo: convert query with spaces into %20

		req.query = "kamasi%20Washington";
		console.warn("FORCING QUERY: ",req.query);
		req.url = "https://api.spotify.com/v1/search?q=" + req.query + "&type=artist";

		req.headers = {};
		req.headers.Authorization = 'Bearer ' + req.token;

		var request_obj = {};
		request_obj.headers = {};
		request_obj.headers.Authorization = 'Bearer ' + req.token;
		request_obj.url = "https://api.spotify.com/v1/search?q=" + req.query + "&type=artist";

		_request(request_obj).then(function(result){

			console.log("search_artists result:",result);

			//todo: assuming first match is always the one we want

			var artist = {};
			result.artists ? artist =  result.artists[0] : {};

			done(artist)

		})

	})
};