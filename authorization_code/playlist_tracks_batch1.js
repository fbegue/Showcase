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
		let offset_base = 50;

		function getPages(options) {
			console.log(options.uri);
			return rp(options).then(data => {
				console.log("data",data.items.length);
				options.store = options.store.concat(data.items);
				//console.log("cacheIT",cacheIT[options.playlist_id].length);
				if (!(data.items.length === 50)){
					let tuple = {};tuple.tracks = options.store;
					tuple.playlist_id = options.playlist_id;
					return tuple;
				}
				else{
					options.offset = options.offset + offset_base ;
				    options.uri =  options.url + "?fields=items.track(id,name,artists)&limit="+ options.limit + "&offset=" + options.offset;
					return getPages(options);
				}
			});
		}

		//todo: just one
		//let t = JSON.parse(JSON.stringify(req.body.playlists));
		//req.body.playlists = [];
		//short 29
		// req.body.playlists.push({id:"0sJK4pWqr7bnQ0fgxGmJrh"});
		//long 146
		//req.body.playlists.push({id:"5vDmqTWcShNGe7ENaud90q"});
		// req.body.playlists.push(t[0]);
		// req.body.playlists.push(t[1]);

		console.log("input length",req.body.playlists.length);
		req.body.playlists.forEach(function(playlist){
			options.url =  url1 + playlist.id + url2;
			options.offset = 0;
			options.limit = 50;
			options.uri = options.url + "?fields=items.track(id,name,artists)&limit=" + options.limit + "&offset=" + options.offset;
			options.playlist_id = playlist.id;
			options.store = [];
			promises.push(getPages(options));
		});

		Promise.all(promises)
			.then(function(results) {
				console.log("playlists processed: ",results.length);
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