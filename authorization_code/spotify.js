//var request = require('request'); // "Request" library
var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');

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


// var two = promiseThrottle.add(myFunction.bind(this, 2));
// var three = promiseThrottle.add(myFunction.bind(this, 3));


module.exports.playlist_tracks = function(req,res){

	return new Promise(function(done, fail) {
		console.log("playlist_tracks",req.body);

		let options = {
			uri: "",
			headers: {
				// 'User-Agent': 'Request-Promise',
				"Authorization":'Bearer ' + req.body.token
			},
			json: true
		};

		let promises = [];
		let url1 = "https://api.spotify.com/v1/playlists/";
		let url2 = "/tracks";
		let payload = {};

		let cache = {};
		let offset_base = 50;

		var pager =  function(options){
			return new Promise(function(done, fail) {
				let sendIt = function(){
					rp(options)
						.then(function(res) {
							var results = res["items"];
							!cache[options.playlist_id] ? cache[options.playlist_id] = [] : {};
							cache[options.playlist_id] = cache[options.playlist_id].concat(results);

							//spotify max limit is 50
							if(results.length === 50){
								payload.offset = payload.offset + offset_base ;
								console.log("new offset: ", payload.offset);
								console.log("records length: ",  cache[options.playlist_id].length);
								options.uri =  payload.url + "?fields=items.track(id,name,artists)&limit="+ payload.limit + "&offset=" + payload.offset;
								return sendIt(options);
							}
							else{
								done(cache[options.playlist_id]);
							}

						}).catch(function(err){

							//todo: WTF just random 404's with no fucking error messages
						console.log("pager ERROR");
						console.log(options.uri);
						console.log(err.message);

						setTimeout(function(){
							return sendIt(options);
						},500)
					})
				};
				sendIt(options)
			})
		};

		//todo: just one
		// let t = JSON.parse(JSON.stringify(req.body.playlists));
		// req.body.playlists = [];
		// req.body.playlists.push({id:"0fEQxXtJS7aTK4qrxznjAJ"});
		// console.log("input len",req.body.playlists.length);

		req.body.playlists.forEach(function(playlist){
			payload = {};
			payload.url =  url1 + playlist.id + url2;
			payload.offset = 0;
			payload.limit = 50;
			options.uri = payload.url + "?fields=items.track(id,name,artists)&limit=" + payload.limit + "&offset=" + payload.offset;
			options.playlist_id = playlist.id;
			//options.uri = "https://api.spotify.com/v1/playlists/5vDmqTWcShNGe7ENaud90q/tracks?limit=50&offset=50";
			promises.push(pager(options));
		});

		Promise.all(promises)
			.then(function(results) {
				console.log("results",results.length);
				//console.log(JSON.stringify(results,null,4));
				//console.log(JSON.stringify(cache,null,4));
				console.log("FINISHED");
				res.send(results);
			})	.catch(function(err) {
			console.log("err");
			console.log(err);
		});
	})//promise

};//playlist_tracks

module.exports.make_request_simple = function(req, res){
	console.log("make_request_simple");
	console.log(req.body);
	//his.type = "POST"
	//todo:
	//req.body = JSON.parse(req.headers['content-type']);
	//req.body = JSON.parse(req.body);
	//req.url = "https://api.spotify.com/v1/search?q=" + req.body.url + "&type=artist";

	var promiseThrottle = new PromiseThrottle({
		requestsPerSecond: 2,           // up to 1 request per second
		promiseImplementation: Promise  // the Promise library you are using
	});

	// var options = {
	// 	uri: "https://api.spotify.com/v1/search?q=" + "Alien Ant Farm" + "&type=artist",
	// 	headers: {
	// 		'User-Agent': 'Request-Promise',
	// 		"Authorization":'Bearer ' + req.body.token
	// 	},
	// 	json: true
	// };

	let options = {
		uri: "",
		headers: {
			'User-Agent': 'Request-Promise',
			"Authorization":'Bearer ' + req.body.token
		},
		json: true
	};

	let url_pre = "https://api.spotify.com/v1/search?q=";
	let url_suf = "&type=artist";

	let promises = [];
	req.body.artists.forEach(function(query){
		options.uri = url_pre + query + url_suf;
		promises.push(promiseThrottle.add(rp.bind(this,options))
			// .then(function(res) {
			// 	console.log("done",res);
			// })
		);
	});

	Promise.all(promises)
		.then(function(results) {
			console.log(results);
			console.log("FINISHED");
			res.send(results);
		});
};

//module.exports.make_request_simple.type = "POST"