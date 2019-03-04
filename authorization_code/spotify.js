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

//todo:
//module.exports.get_user_playlists

//todo: try getPages again but check that options is being preserved
//let op = JSON.parse(JSON.stringify(options));


module.exports.playlist_tracks = function(req,res){

	return new Promise(function(done, fail) {
		console.log("playlist_tracks",JSON.stringify(req.body,null,4));

		let options = {
			uri: "",
			headers: {
				// 'User-Agent': 'Request-Promise',
				"Authorization":'Bearer ' + req.body.token
			},
			json: true
		};

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
					// let tuple = {};tuple.tracks = options.store;
					// tuple.playlist_id = options.playlist_id;
					// return tuple;
					return options.store;
				}
				else{
					options.offset = options.offset + offset_base ;
					options.uri =  options.url + "?fields=items.track(id,name,artists)&limit="+ options.limit + "&offset=" + options.offset;
					return getPages(options);
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

		options.url =  url1 + req.body.playlist.id + url2;
		options.offset = 0;
		options.limit = 50;
		options.uri = options.url + "?fields=items.track(id,name,artists)&limit=" + options.limit + "&offset=" + options.offset;
		options.playlist_id = req.body.playlist.id;
		options.store = [];

		getPages(options).then(function(results){
			console.log("results ",results.length);
			let payload = {}; payload.tracks = results;payload.playlist_id = options.playlist_id;
			console.log("FINISHED");
			res.send(payload);
		})
	})//promise

};//playlist_tracks

module.exports.get_artists = function(req, res){

	// console.log("search_artists",JSON.stringify(req.body,null,4));
	console.log("get_artists",req.body.queries.length);

	// var promiseThrottle = new PromiseThrottle({
	// 	requestsPerSecond: 5,           // up to 1 request per second
	// 	promiseImplementation: Promise  // the Promise library you are using
	// });

	let options = {
		uri: "",
		headers: {
			'User-Agent': 'Request-Promise',
			"Authorization":'Bearer ' + req.body.token
		},
		json: true
	};

	let url_pre = "https://api.spotify.com/v1/artists?ids=";
	let promises = [];

	req.body.queries.forEach(function(multiArtistStr){
		options.uri = url_pre + multiArtistStr;
		//console.log(options.uri);

		//todo: for some reason the results that come back using throttle
		//are different then those in just a rp call. not the timing, the literal results
		// promises.push(promiseThrottle.add(rp.bind(this,options)))

		promises.push(rp(options))
		// .then(function(res) {
		// 	console.log("completed:",options.uri);
		// 	console.log("#",res.length);
		// }))

	});

	Promise.all(promises)
		.then(function(results) {
			//console.log(results);
			console.log("FINISHED");
			res.send(results);
		});
};

module.exports.search_artists = function(req, res){
	// console.log("search_artists",JSON.stringify(req.body,null,4));
	console.log("search_artists",req.body.perfTuples.length);

	//his.type = "POST"
	//todo:
	//req.body = JSON.parse(req.headers['content-type']);
	//req.body = JSON.parse(req.body);
	//req.url = "https://api.spotify.com/v1/search?q=" + req.body.url + "&type=artist";

	var promiseThrottle = new PromiseThrottle({
		requestsPerSecond: 10,
		//362
		// requestsPerSecond: 20,
		//124
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



	var searchReq =  function(options){
	    return new Promise(function(done, fail) {
	    	let op = JSON.parse(JSON.stringify(options));
		    rp(options).then(function(res){
			    // console.log(res);
			    // console.log(op);
			    //todo: in the future, probably need better checking on this
			    //maybe some kind of memory system where, if there's an ambiguous artist name
			    //and I make a correct link, I can save that knowledge to lean on later
			    let tuple = {artistSongkick_id:op.artistSongkick_id};
			    if(res.artists.items.length > 0){
				    tuple.artist = res.artists.items[0]
			    }
			    else{
				    tuple.artistName = op.displayName;
				    tuple.error = true;
				    tuple.artistSearch = op.displayName_clean;
			    }
		    	done(tuple)
		    })
	    })
	};

	req.body.perfTuples.forEach(function(tuple){
		//spotify says it requires this, maybe rp is doing conversion for me? idk
		tuple.displayName_clean =  tuple.displayName.replace(/\(US\)/g, ""); //%20
		tuple.displayName_clean =  tuple.displayName_clean.replace(/[^a-zA-Z\s]/g, ""); //%20
		//ex: 'Zoso – the Ultimate Led Zeppelin Experience'
		//that's not a hyphen
		options.uri = url_pre + tuple.displayName_clean  + url_suf;
		options.artistSongkick_id = tuple.artistSongkick_id;
		options.displayName_clean = tuple.displayName_clean;
		options.displayName = tuple.displayName;
		//console.log(options.artistSongkick_id);
		//console.log(options.uri);
		//promises.push(searchReq(options))
		//promises.push(rp(options))
		promises.push(promiseThrottle.add(searchReq.bind(this,options)));
		// .then(function(res) {
		// 	console.log("done",res);
		// })
	});

	Promise.all(promises)
		.then(function(results) {
			//console.log(results);
			console.log("FINISHED");
			res.send(results);
		}).catch(function(err){
		console.log(err);
	})
};

//module.exports.make_request_simple.type = "POST"