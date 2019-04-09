//var request = require('request'); // "Request" library
var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');
var google = require('google');
var scraper = require('google-search-scraper');
var Bottleneck = require("bottleneck")

var $ = require('cheerio');

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

//const { JSDOM } = require( 'jsdom' );

// var promiseThrottle_Wiki = new PromiseThrottle({
//
//  okay wtf is going on here?  i broke it at 2000 lmfao WOW!
// 	requestsPerSecond: 1000,
// 	promiseImplementation: Promise
// });


//todo:
let all_genres = require('./public/all_genres2');

let genresMap = {};
//console.log("$all_genres",all_genres.all_genres);

all_genres.all_genres.forEach(function(t){
	genresMap[t.name] = "dum"
});






//todo: little weird b/c when we update genre info client side,
//we can't make decisions with that updated info here

module.exports.getExternalInfos  = function(req,res) {
	console.log("getExternalInfos",req.body.artists.length);

	let startDate = new Date();
	console.log("start time:",startDate);


	//fixme: subset
	// let set = JSON.parse(JSON.stringify(req.body.artists))
	// 	// req.body.artists = [set[0],set[111],set[222],set[333]]




	let doBrainz = function(){
		//ex: getArtistById
		//http://musicbrainz.org/ws/2/artist/e9787dd2-5857-4b51-8e59-a190a54820fc?inc=genres&fmt=json

		//ex: query artist
		//https://musicbrainz.org/ws/2/artist/?query=The%20Polish%20Ambassador&fmt=json

		//desired format for queries (full Lucene Search syntax)
		//https://lucene.apache.org/core/4_3_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description

		let queryCode = function (exp) {

			//let exp = "Guns N' Roses";
			//result: Guns_N%27_Roses

			//wiki likes _ for spaces
			//exp = exp.replace(/\s/g, '_');

			//https://www.w3schools.com/tags/ref_urlencode.asp
			exp = encodeURI(exp);

			//not handling apostrophes/single quotes?
			//exp = exp.replace("'", "%27");

			console.log(exp);
			return exp;
		};

		let musicBrainzLookup =  function(artistId){
			return new Promise(function(done, fail) {
				let lookArtist_pre = "http://musicbrainz.org/ws/2/artist/"
				let lookArtist_post = "?inc=genres&fmt=json";

				//artistId = "e9787dd2-5857-4b51-8e59-a190a54820fc"

				let url = lookArtist_pre + artistId + lookArtist_post;
				let options = {
					method: "GET",
					uri: url,
					headers: {
						'User-Agent': 'Request-Promise',
					},
				};
				console.log(url);
				rp(options).then(function (result) {
					//console.log("#####",JSON.stringify(JSON.parse(result),null,4));
					let resultP = JSON.parse(result);
					done(resultP.genres)
				})
			})
		};

		let musicBrainzQry =  function(artist){
			return new Promise(function(done, fail) {
				let queryArtist_pre = "https://musicbrainz.org/ws/2/artist/?query=";
				let queryArtist_post = "&fmt=json";

				//artist.name = "Muse"
				let url = queryArtist_pre + queryCode(artist.name) + queryArtist_post;
				let options = {
					method: "GET",
					uri: url,
					headers: {
						// 'User-Agent': 'Request-Promise',
						'User-Agent': 'Showcase/alpha (dacandyman0@gmail.com)',
					},
					//json: true
				};
				console.log(url);
				rp(options).then(function (result) {
					//console.log("$$$$$$",JSON.stringify(JSON.parse(result),null,4));
					let resultP = JSON.parse(result);

					//todo: always assume first artist is what who we want
					//in the future, how can we tell how many results are useful?
					//many ids for the same entity, but who has the genres info?
					//is it ever useful to tranverse past the first (score = 100?)


					if(resultP.artists.length === 0){
						console.log("$$$no musicbrainz match found for",artist.name);
						done([])
					}
					else{

						done(resultP.artists[0])
						//todo: managing the API rate while having a request in a request is hard

						// var wait =  function(ms){
						// 	return new Promise(function(done, fail) {
						// 		console.log("waiting...");
						// 		setTimeout(function(){
						// 			console.log("done!");
						// 			done()
						// 		},ms);
						// 	})
						// }
						//
						// wait(2000).then(function(){
						//
						// 	musicBrainzLookup(resultP.artists[0].id).then(function(genres){
						// 		if(genres.length === 0){
						// 			console.log("$no musicbrainz genres found for",resultP.artists[0].name);
						// 		}
						// 		done(genres);
						// 	})
						// })
					}
				})
			})
		};

		var promiseThrottle_brainz = new PromiseThrottle({

			//https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting#Provide_meaningful_User-Agent_strings
			//am i missing something here? whats the point of having limit of 50/sec/user when the IP limit is 1/sec/ip

			//therefore, even 2 begins the fuckoff sequence :(
			requestsPerSecond: 1,
			promiseImplementation: Promise  // the Promise library you are using
		});

		let brainPromises = [];
		req.body.artists.forEach(function(ar){
			// brainPromises.push(musicBrainzQry(ar))
			brainPromises.push(promiseThrottle_brainz.add(musicBrainzQry.bind(this,ar)));

		});

		Promise.all(brainPromises).then(function(brainResults){
			console.log("brainResults",brainResults);
			//genres? store them
			//otherwise go to wiki? does wiki always have same info?
		});
	}

	//todo: readup on possibly combining some of these searches?
	//https://www.mediawiki.org/wiki/API:Etiquette


	const limiterWiki = new Bottleneck({
		maxConcurrent: 15,
		minTime: 100,
		trackDoneStatus: true
	});

	const limiterGoogle = new Bottleneck({
		maxConcurrent: 10,
		minTime: 400,
		trackDoneStatus: true
	});

	let wikiPromises = [];
	let wReq = {};
	let wikiResults = [];
	let wikiResultsKeep = [];
	let googleResults = [];
	let googleFailures = [];

	req.body.artists.forEach(function(ar){
		wReq = {};
		wReq.body = {};
		wReq.body.artist = ar;
		// wikiPromises.push(promiseThrottle_Wiki.add(module.exports.getWikiPage.bind(this,wReq)));
		limiterWiki.schedule(module.exports.getWikiPage,wReq,{}).then((resWiki) => {

			let gReq = {};
			gReq.body = {artist:resWiki.artist};

			wikiResults.push(resWiki);
			let knownGenres = [];

			//fixme:
			//wikiRes.facts = [];

			if(resWiki.facts.length !== 0) {
				resWiki.facts.forEach(function (f) {
					if (genresMap[f]) {
						knownGenres.push(f);
					}
				});

				//todo: could decide on theshold # of genres
				if(knownGenres.length !== 0) {
					let resp = {genres:knownGenres,artist:wReq.body.artist};
					wikiResultsKeep.push(resp);

				}else{
					//no known genres came from the facts

					//googlePromises.push(promiseThrottle_Google.add(module.exports.googleQuery.bind(this,gReq)));

					limiterGoogle.schedule({expiration:2000,id:gReq.body.artist.name},module.exports.googleQueryBands,gReq).then((gRes) => {
						//let resp = {html:gRes,artist:wReq.body.artist};
						googleResults.push(gRes);
					}).catch(function(err){

						//getting rReq's artist name seems to work, but i don't trust it?
						let error = {artist:gReq.body.artist.name,error:err};
						googleFailures.push(error);

					});

					//todo: disabled scraping for now

					// limiterGoogle.schedule(module.exports.googleQueryScrape,gReq,{}).then((gRes) => {
					// 	//let resp = {html:gRes,artist:wReq.body.artist};
					// 	googleResults.push(gRes);
					// });
				}
			}else{
				//no facts


				//todo: not sure about experiation timeout length

				limiterGoogle.schedule({expiration:4000,id:gReq.body.artist.name},module.exports.googleQueryBands,gReq,{}).then((gRes) => {
					//let resp = {html:gRes,artist:wReq.body.artist};

					googleResults.push(gRes);

					//todo: meeehhh
					// if(gRes.htmlBand.indexOf('Genres') === -1){
					// 	console.log("$gbandfail==================");
					//
					// 	limiterGoogle.schedule(module.exports.googleQueryScrape,gReq,{}).then((gRes) => {
					// 		//let resp = {html:gRes,artist:wReq.body.artist};
					//
					// 		googleResults.push(gRes);
					//
					// 		//todo: scrape gres is more compilcated then just indexOf
					//
					// 		// if(gRes.indexOf('Genres') === -1){
					// 		// 	// console.log("$gscrapefail==================");
					// 		// 	googleFailures.push(gRes);
					// 		// }
					// 		// else{
					// 		// 	googleResults.push(gRes);
					// 		// }
					//
					// 	});
					// }
					// else{
					// 	googleResults.push(gRes);
					// }


				}).catch(function(err){
					let error = {artist:gReq.body.artist.name,error:err};
					googleFailures.push(error);

				});

				//todo: disabled scraping for now


			}

			// if(resWiki.facts.length !== 0){
			// 	wikiResults.push(resWiki);
			// }
			// else {
			// 	limiterWiki.schedule(module.exports.getWikiPage,wReq,{}).then((resGoogle) => {
			// 		googleResults.push(resGoogle);
			// 	});
			// }

		});//schedule wiki promise return
	});

	var wait =  function(ms){
		return new Promise(function(done, fail) {
			//console.log("waiting...");
			setTimeout(function(){
				//console.log("done!");
				done()
			},ms);
		})
	};

	let totalTime = 0;
	let checkCount = function() {

		wait(100).then(function () {
			//done = limiter.jobs("RUNNING");done.length
			totalTime = totalTime + 100;
			//console.log("wRK:" + wikiResultsKeep.length + " || " + googleResults.length + " === " + req.body.artists.length);
			if((wikiResultsKeep.length + googleResults.length + googleFailures.length) !== req.body.artists.length){

				if(totalTime % 5000 === 0){
					console.log("wiki...",limiterWiki.counts());
					console.log("google...",limiterGoogle.counts());

					console.log(limiterGoogle.jobs("EXECUTING"));

				}

				checkCount()
			}else{
				console.log("getExternalInfos finished execution:",Math.abs(new Date() - startDate) / 600);

				console.log(wikiResultsKeep.length + " wiki results were successful");
				console.log(googleResults.length + " google results were returned");
				// console.log("FINISHED!",JSON.stringify(wikiResults,null,4));
				// console.log("FINISHED!",JSON.stringify(googleResults,null,4));

				let ret = wikiResultsKeep.concat(googleResults);
				res.send(ret);
			}
		})
	};
	checkCount();

	// Promise.all(wikiPromises).then(function(wikiResults){
	// 	console.log("wikiResults",JSON.stringify(wikiResults,null,4));
	// 	console.log("wikiResults #",wikiResults.length);
	//
	// 	let knownGenres = [];
	// 	let googlePromises = [];
	//
	// 	var promiseThrottle_Google = new PromiseThrottle({
	//
	// 		//todo:hmmmmmm
	// 		requestsPerSecond: 1,
	// 		promiseImplementation: Promise
	// 	});
	//
	// 	// let googleQry = function(){
	// 	// 	let gReq = {};
	// 	// 	gReq.body = {query:req.body.artist.name};
	// 	//
	// 	// 	module.exports.googleQuery(gReq).then(function(gRes){
	// 	// 		//console.log("gRes",gRes);
	// 	// 		let resp = {html:gRes,artist:req.body.artist};
	// 	// 		res.send(resp);
	// 	// 	});
	// 	// };
	//
	// 	//need to dermtine if facts are good
	//
	// 	//todo: this is esentially disallowing us to 'discover' new genres thru wiki
	// 	//for now, if you're not a genre, we're throwing you out
	//
	// 	wikiResults.forEach(function(wikiRes){
	// 		let gReq = {};
	// 		gReq.body = {query:wikiRes.artist.name};
	//
	//
	// 		//fixme:
	// 		wikiRes.facts = [];
	//
	// 		if(wikiRes.facts.length !== 0) {
	// 			wikiRes.facts.forEach(function (f) {
	// 				if (genresMap[f]) {
	// 					knownGenres.push(f);
	// 				}
	// 			});
	//
	// 			//todo: could decide on theshold # of genres
	// 			if(knownGenres.length !== 0) {
	// 				let resp = {genres:knownGenres,expression:req.body.expression}
	//
	// 				//todo: put aside and return with google results
	// 				// res.send(resp);
	//
	// 			}else{
	// 				googlePromises.push(promiseThrottle_Google.add(module.exports.googleQuery.bind(this,gReq)));
	// 			}
	//
	// 		}else{
	// 			//no facts
	// 			googlePromises.push(promiseThrottle_Google.add(module.exports.googleQuery.bind(this,gReq)));
	// 		}
	// 	});
	//
	// 	console.log(googlePromises.length + " googlePromises....");
	//
	// 	Promise.all(googlePromises).then(function(googleResults){
	//
	// 		console.log("googleResults",googleResults);
	//
	// 	})
	//
	// })
};


//todo: test in workflow above

module.exports.getCampPage = function(res,req){

	req.body = {};req.body.artist = {};
	req.body.artist.name = "Lily Kerbey";

	let options = {
		method: "GET",
		uri: "https://bandcamp.com/search?q=" + encodeURI(req.body.artist.name),
		headers: {
			'User-Agent': 'Request-Promise',
		}
	};
	console.log(options.uri);
	rp(options).then(function (result) {
		//console.log("$CAMP",result);

		//https://cheerio.js.org/

		let info = $(result).find('.result-info');
		console.log(info.length);
		let first = false;

		info.each(function(i,elem){

			//each info has 5 children. we're looking for one of them to contain artist
			//if the info child has 'artist' then we need to examine the info
			let ren = $(this).children()

			ren.each(function(k,elem){
				let t = $(this).text();
				t = t.trim();

				if(t === "ARTIST"){
					console.log(t,i);
					first === false ? first = i:{};
				}
			})
		});

		//note: seems like GENRE is always just one (well Hip-Hop/Rap is an exception)
		let gtext = $(info[first]).find('.genre').text().replace('genre:',"").trim().toLowerCase();
		//console.log("genre:",gtext);

		//tags
		let spaces = /\s{2}/g;
		let lead_trail = /^\s|\s$/g;
		let ttext = $(info[first]).find('.tags').text().replace('tags:',"").replace(spaces,"").replace(lead_trail,"").toLowerCase()
		//console.log("tags:",ttext);

		let genres = [];

		if(ttext.indexOf(",") !== -1){
			genres = ttext.split(",");
		}else{
			genres.push(ttext);
		}

		//often the genre is repeated in the tags
		if(genres.indexOf(gtext) ===  -1){
			genres.push(gtext);
		}

		let tup = {artist:req.body.artist,genres:genres};
		console.log(tup.artist.name + " :" + genres);
		return tup

	})
}

module.exports.getWikiPage = function(req,res) {

	return new Promise(function(done, fail) {

		//console.log("getWikiPage",req.body.artist);

		let artist = req.body.artist;
		let artist_save = JSON.parse(JSON.stringify(req.body.artist));

		//no content fields specified
		//https://en.wikipedia.org/w/api.php?action=query&format=jsonfm&formatversion=2&titles=Wynchester

		//i'm feeling lucky? just go to whatever page has that title

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
			"&titles=" + code_prefix(artist.name) + "&format=json";
		//console.log("URI encode exp:",code_prefix(artist.name));
		//console.log("URL:",url);

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
			response.artist = artist_save;

			function removeDups(records) {
				let unique = {};
				records.forEach(function(i) {
					if(!unique[i]) {	unique[i] = true;}});
				return Object.keys(unique);
			}

			response.facts = removeDups(facts);

			done(response)
			//res.send(response)

		}).catch(function (err) {
			console.log(err);
		})

	})//promise
};

var DeathByCaptcha = require('deathbycaptcha');
var dbc = new DeathByCaptcha('dacandyman0', 'Segasega4$');


let simple_google = function(req){

	let options = {
		method: "GET",
		uri: "https://www.google.com/#q=" + req.body.query,
		// headers: {
		// 	'User-Agent': 'Request-Promise',
		// },
		//json: true
	};
	rp(options).then(function (result) {
		console.log(result);
	})

};

module.exports.googleQueryBands = function(req,res) {
	console.log("googleQuery",req.body.artist.name);

	return new Promise(function(done, fail) {

		var optionsBands = {
			query: req.body.artist.name + "bandsintown",
			host: 'www.google.com',
			// lang: 'fr',
			// age: 'd1', // last 24 hours ([hdwmy]\d? as in google URL)
			limit: 2,
			solver:dbc,
			params: {} // params will be copied as-is in the search URL query string
		};

		let urls = [];

		//todo: this callback is called 10 times? why?
		scraper.search(optionsBands, function(err, url,meta) {
			// This is called for each result
			if(err) throw err;
			urls.push(meta.url);

			urls.length === 10 ? console.log(urls[0]) : {};

			let options = {
				method: "GET",
				uri: urls[0],
				headers: {
					'User-Agent': 'Request-Promise',
				},
				//json: true
			};
			rp(options).then(function (result) {
				let payload = ({htmlBand:result,artist:req.body.artist})
				done(payload)
			}).catch(function(err){
				throw err;
			})

		});


		//todo: attempts to get consistent google results

		//google.resultsPerPage = 1;
		//quotes useful?
		//ex: '"SongWrita" music artist' versus 'SongWrita music artist'

		//this is a way to signal google to use the 'knowledge panel' regarding musical artists
		//ex: google query 'Funk Worthy musical artist' versus 'Funk Worthy musical group'

		//let query = "\"" + req.body.query + "\" musical artist";

		//didn't seem to help
		//let locationParm = "loc:" + "Columbus"



		//todo: old google query, trying to get at knowledge panels

		//let query = req.body.query;
		// let query = "" + req.body.artist.name + " musical artist";
		//console.log("querying google...",query);
		// google(query, function (err, result){
		// 	if (err) console.error(err);
		//
		// 	console.log(result);
		// 	res.send(result.body)
		// 	//done({html:result.body,artist:req.body.artist})
		//
		// })

	})//promise
};

module.exports.googleQueryScrape  = function(req,res) {
	//console.log("googleQuery",req.body.query);

	return new Promise(function(done, fail) {



		var optionsScrape = {
			query: req.body.query,
			host: 'www.google.com',
			// lang: 'fr',
			// age: 'd1', // last 24 hours ([hdwmy]\d? as in google URL)
			limit: 10,
			solver: dbc,
			params: {} // params will be copied as-is in the search URL query string
		};

		let titles = [];
		let descs = [];

		scraper.search(optionsScrape, function(err, url,meta) {
			// This is called for each result
			if(err) throw err;
			//console.log(url)
			titles.push(meta.title);
			descs.push(meta.desc);

			if(titles.length === 10){
				//console.log("$SCRAPE");
				// console.log(titles);
				// console.log(descs);
				let payload = ({titles:titles,descs:descs,artist:req.body.artist})
				done(payload)
			}
		});

	})//promise
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
		//console.log("playlist_tracks",JSON.stringify(req.body,null,4));
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
				"Authorization":'Bearer ' + req.body.token
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
					"Authorization":'Bearer ' + req.body.token
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
			res.send(payloads);
		})
	})//promise

};//playlist_tracks

module.exports.get_artists = function(req, res){
	console.log("get_artists payload size:",req.body.queries.length * 50);
	console.log("# of requests to resolve:",req.body.queries.length);

	let startDate = new Date();
	console.log("start time:",startDate);

	//todo: why the fuck is this so fast lol :) ????

	var promiseThrottle = new PromiseThrottle({

		//35 mostly works, but occasional failure for a 1 second reduction seems silly

		requestsPerSecond: 15,           // up to 1 request per second
		promiseImplementation: Promise  // the Promise library you are using
	});

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

	//todo:
	// console.log("TESTING WITH SUBSET!");
	// let subset = JSON.parse(JSON.stringify(req.body.queries))
	// req.body.queries = [];
	// req.body.queries.push(subset[0])
	// req.body.queries.push(subset[1])
	// req.body.queries.push(subset[2])

	req.body.queries.forEach(function(multiArtistStr){
		options = {
			uri: "",
			headers: {
				'User-Agent': 'Request-Promise',
				"Authorization":'Bearer ' + req.body.token
			},
			json: true
		};

		options.uri = url_pre + multiArtistStr;
		promises.push(promiseThrottle.add(rp.bind(this,options)))
	});

	Promise.all(promises)
		.then(function(results) {
			//console.log(results);
			console.log("get_artists finished execution:",Math.abs(new Date() - startDate) / 600);
			res.send(results);
		})
};

module.exports.search_artists = function(req, res){
	// console.log("search_artists",JSON.stringify(req.body,null,4));
	console.log("search_artists",req.body.perfTuples.length);

	let startDate = new Date();
	console.log("start time:",startDate);


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
			}).catch(function(e){
				console.log("searchReq failure",e);
				fail(e)
			});
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
			console.log("search_artists finished execution:",Math.abs(new Date() - startDate) / 600);
			console.log("FINISHED");
			res.send(results);
		}).catch(function(err){
		console.log(err);
	})
};

//module.exports.make_request_simple.type = "POST"