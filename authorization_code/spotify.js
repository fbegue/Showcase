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


var searchReq =  function(options){
	return new Promise(function(done, fail) {
		let op = JSON.parse(JSON.stringify(options));
		rp(options).then(function(res){

		})
	})
};

//todo: for actual searching

//https://www.mediawiki.org/wiki/API:Query

// $.ajax({
// 	 url: "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + keyword + "&prop=info&inprop=url&utf8=&format=json",
// 	dataType: "jsonp",
// 	success: function(response) {
// 		console.log(response.query);
// 		if (response.query.searchinfo.totalhits === 0) {
// 			console.error(response);
// 		}
// 		else {
// 			console.log(response);
// 		}
// 	},
// 	error: function () {
// 		alert("Error retrieving search results, please refresh the page");
// 	}
//
// });




//take the query, format it for wikipedia, and try to hit the exact page on the wiki

//todo:
//if we don't hit that exact right page OR hit one that isn't music, we're fucked
//todo:


var google = require('google')
var $ = require("jquery");


//ideas and attempts at getting google results for artist searches

//google used to have a search api that was pretty open and good, but no more
//apparantly you may be able to hack custom search to search anywhere? idk
//https://developers.google.com/custom-search/v1/using_rest#search_results

// serpapi - designed specficially for this purpose, costs $$$

//knowledge graph
//where are the genres?
//https://developers.google.com/apis-explorer/#p/kgsearch/v1/kgsearch.entities.search?query=moon+hooch&types=MusicGroup&_h=1&

//const GoogleHtmlParser = require('google-html-parser');
//seemingly useless parsing

// 	let options = {};
// 	GoogleHtmlParser.parse(options, res.body, function(err, extractedDatas){
// 		console.log("$e",extractedDatas);
// 	});
//
// 	GoogleHtmlParser.parse(options, res.body)
// 		.then(parsedDatas => {
// 			console.log("$p",parsedDatas);
// 		});


// let google = require('google-parser');
//google.google is not a function (maybe I can only use this with type script?)

// google.google({search: "Moon Hooch"}).then(function(res){
// 	console.log("$res",res);
// })


module.exports.googleQuery  = function(req,res) {
	console.log("googleQuery",req.body.query);

	google.resultsPerPage = 1;
	google(req.body.query, function (err, result){
		if (err) console.error(err);

		res.send(result.body)
	})
};



module.exports.getWikiPage = function(req,res) {

	let expression = req.body.expression.name;
	let expression_save = JSON.parse(JSON.stringify(req.body.expression));

	//no content fields specified
	//https://en.wikipedia.org/w/api.php?action=query&format=jsonfm&formatversion=2&titles=Wynchester

	//i'm feeling lucky? just go to whatever page has that title
	expression = expression.replace();

	let code_prefix = function (exp) {
		//let exp = "Guns N' Roses";
		//result: Guns_N%27_Roses

		//wiki likes _ for spaces
		exp = exp.replace(/\s/g, '_');

		//https://www.w3schools.com/tags/ref_urlencode.asp
		exp = encodeURI(exp);

		//not handling apostrophes/single quotes?
		exp = exp.replace("'", "%27");
		return exp;
	};

	//todo: can I get any smaller than this?
	// its just getting content, don't think I can go lower than that
	//https://www.mediawiki.org/wiki/API:Revisions

	let url = "https://en.wikipedia.org/w/api.php?action=query" +
		"&prop=revisions" +
		"&rvprop=content" +
		"&format=jsonfm" +
		"&formatversion=2" +
		"&titles=" + code_prefix(expression) + "&format=json";
	console.log("URI encode exp:",code_prefix(expression));
	console.log("URL:",url);

	let options = {
		method: "POST",
		uri: url,
		headers: {
			'User-Agent': 'Request-Promise',
			"Content-Type": "jsonp"
		},
		//json: true
	};

	rp(options).then(function (result) {
		result = JSON.parse(result);
		//console.log("res", JSON.stringify(result,null,4));
		let facts = [];


		if(!result.query['pages'][0].missing){
			//don't know what n pages or n revisions means as of yet
			let content = result.query['pages'][0]['revisions'][0]['content'].toString();

			//what is the prevelance of people actually using the correct template?
			//I'm putting my money on pretty high
			let infoStr = "Infobox musical artist"
			let pat = /\[\[([A-Za-z\s\|]*)\]\]/gs

			if(content.indexOf(infoStr) !== -1){
				let matches = content.match(pat);
				//console.log(matches);

				let pat2 = /[^\w\s]/g;
				matches.forEach(function(m){
					if(m.indexOf("|") !== -1){
						let split = m.split("|")
						//console.log("$",split);
						let a = split[0].replace(pat2," ").toLowerCase().trim();
						let b = split[1].replace(pat2," ").toLowerCase().trim();
						//console.log(a);console.log(b);
						facts.push(b);facts.push(a);
					}
					else{
						let y = m.replace(pat2," ").toLowerCase().trim()
						//console.log("#",y);
						facts.push(y)
					}
				});
			}
		}

		//console.log(JSON.stringify(facts));
		let response = {};
		response.expression = expression_save;

		function removeDups(records) {
			let unique = {};
			records.forEach(function(i) {
				if(!unique[i]) {	unique[i] = true;}});
			return Object.keys(unique);
		}

		response.facts = removeDups(facts);
		res.send(response)

	}).catch(function (err) {
		console.log(err);
	})

	let aj = function(){
		$.ajax({
			url: url,
			dataType: "jsonp",
			success: function(response) {
				//console.log("response",response);

				//don't know what n pages or n revisions means as of yet
				let content = response.query['pages'][0]['revisions'][0]['content'].toString();

				let infoStr = "Infobox musical artist"
				let pat = /\[\[([A-Za-z\s\|]*)\]\]/gs

				if(content.indexOf(infoStr) !== -1){
					//console.log("matched infobox",content);

					let matches = content.match(pat);
					//console.log(matches);

					let facts = [];
					let pat2 = /[^\w\s]/g;

					matches.forEach(function(m){
						if(m.indexOf("|") !== -1){
							let split = m.split("|")
							//console.log("$",split);
							let a = split[0].replace(pat2," ").toLowerCase().trim();
							let b = split[1].replace(pat2," ").toLowerCase().trim();
							//console.log(a);console.log(b);
							facts.push(b);facts.push(a);
						}
						else{
							let y = m.replace(pat2," ").toLowerCase().trim()
							console.log("#",y);
							facts.push(y)
						}
					});

					facts.forEach(function(f){
						if($scope.genreFam_map[f]){
							console.log("true",f);
						}
					});
					// console.log($scope.genreFam_map);
					// console.log(facts);
				}
			},
			error: function () {
				alert("Error retrieving search results, please refresh the page");
			}

		});
	}

};

//https://www.mediawiki.org/wiki/API:Query
//for searching

// $.ajax({
// 	 url: "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + keyword + "&prop=info&inprop=url&utf8=&format=json",
// 	dataType: "jsonp",
// 	success: function(response) {
// 		console.log(response.query);
// 		if (response.query.searchinfo.totalhits === 0) {
// 			console.error(response);
// 		}
// 		else {
// 			console.log(response);
// 		}
// 	},
// 	error: function () {
// 		alert("Error retrieving search results, please refresh the page");
// 	}
//
// });


//todo: haven't tested yet
module.exports.playlist_add_artist_tracks =  function(req,res){
	return new Promise(function(done, fail) {

		console.log(req.body.token);
		console.log(req.body.playlist);
		console.log(req.body.artist);
		console.log(req.body.max);

		let local = {body:{}};
		Object.assign(local.body,req.body);
		local.body.local = true;

		module.exports.artist_topTracks(local).then(function(result1){
			console.log("result1",result1);

			let local2 = {body:{}};
			Object.assign(local2.body,req.body);
			// local2.body.playlist = req.body.playlist;

			local2.body.tracks = result1.tracks;
			local2.body.local = true;

			module.exports.playlist_add_tracks(local2).then(function(result2){

				console.log("result2",result2);

			})
		})
	})
};


//sometimes this seems to just run 1x, 2x more randomly?

module.exports.playlist_add_tracks =  function(req,res){
	return new Promise(function(done, fail) {

		console.log(req.body.playlist);
		console.log(req.body.tracks);

		let uri =  "https://api.spotify.com/v1/playlists/" + req.body.playlist.id + "/tracks?uris=";
		// let track_uri = "spotify:track:";
		let track_uri = "spotify%3Atrack%3A";
		let options = {
			method:"POST",
			uri: uri,
			headers: {
				'User-Agent': 'Request-Promise',
				"Authorization":'Bearer ' + req.body.token,
				"Content-Type":"application/json"
			},
			json: true
		};

		req.body.tracks.forEach(function(track,i){
			options.uri += track_uri + track.id;
			i !== req.body.tracks.length - 1 ? options.uri =  options.uri + "%2C" :{}
		});

		console.log(options.uri);

		rp(options).then(function(result){
			console.log("res",result);

			if(req.body.local){
				done(result);
			}

			//res.send(result)


		}).catch(function(err){
			console.log(err);
		})

	})
};

module.exports.artist_topTracks =  function(req,res){
	return new Promise(function(done, fail) {

		console.log(req.body.artist);
		console.log(req.body.local);

		let uri =  "https://api.spotify.com/v1/artists/" + req.body.artist.id + "/top-tracks?country=US";
		let options = {
			method:"GET",
			uri: uri,
			headers: {
				'User-Agent': 'Request-Promise',
				"Authorization":'Bearer ' + req.body.token,
				// "Content-Type":"application/json"
			},
			json: true
		};

		rp(options).then(function(result){
			console.log("result",result);
			if(req.body.local){
				done(result);
			}
			//res.send(result);

		}).catch(function(err){
			console.log(err);
		})
	})
};

module.exports.playlist_create =  function(req,res){
	return new Promise(function(done, fail) {

		console.log(req.body.user);

		let uri = "https://api.spotify.com/v1/users/" + req.body.user.id + "/playlists";
		let options = {
			method:"POST",
			uri: uri,
			headers: {
				'User-Agent': 'Request-Promise',
				"Authorization":'Bearer ' + req.body.token,
				"Content-Type":"application/json"
			},
			json: true
		};

		options.body = {
			"name": "New Playlist Test1",
			"description": "New Playlist Test1 description",
			"public": false
		};

		rp(options).then(function(res){
			console.log("res",res);
		}).catch(function(err){
			console.log(err);
		})
	})
};

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


	let tuple = {}
	var searchReq =  function(options){
		return new Promise(function(done, fail) {
			let op = JSON.parse(JSON.stringify(options));
			rp(options).then(function(res){
				//  console.log(res);
				// console.log(op);
				//todo: in the future, probably need better checking on this
				//maybe some kind of memory system where, if there's an ambiguous artist name
				//and I make a correct link, I can save that knowledge to lean on later
				tuple = {};
				tuple = {artistSongkick_id:op.artistSongkick_id};
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

		options = {
			uri: "",
			headers: {
				'User-Agent': 'Request-Promise',
				"Authorization":'Bearer ' + req.body.token
			},
			json: true
		};

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
			//console.log(JSON.stringify(results,null,4));
			console.log("FINISHED");
			res.send(results);
		}).catch(function(err){
		console.log(err);
	})
};

//module.exports.make_request_simple.type = "POST"