//var request = require('request'); // "Request" library
var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');
var google = require('google');
var scraper = require('google-search-scraper');
var Bottleneck = require("bottleneck")

var $ = require('cheerio');

const colors = require('colors/safe');
console.error = function(msg){console.log(colors.red(msg))};
console.warn = function(msg){console.log(colors.yellow(msg))};
console.good = function(msg){console.log(colors.green(msg))};


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

let resultCache = {};

module.exports.getInfos  = function(req,res) {
	console.log("getInfo input artists length:",req.body.artists.length);
	//console.log("getInfo",req.body.token);

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


	//todo: 10 per second
	const limiterSpotify = new Bottleneck({
		maxConcurrent: 10,
		minTime: 100,
		trackDoneStatus: true
	});

	const limiterWiki = new Bottleneck({
		maxConcurrent: 15,
		minTime: 100,
		trackDoneStatus: true
	});

	const limiterCamp = new Bottleneck({
		maxConcurrent: 10, //15
		minTime: 500, //100
		trackDoneStatus: true,

		//todo: never got this working

		// reservoir: 25, // initial value
		// reservoirIncreaseAmount: 100,
		// reservoirIncreaseInterval: 1000, // must be divisible by 250
		// reservoirIncreaseMaximum: 10000,

		//todo: worked but didn't solve issue

		// 60 requests every 60 seconds:
		// reservoir: 60,
		// reservoirRefreshAmount: 60,
		// reservoirRefreshInterval: 60 * 1000,


		// reservoir: 30,
		// reservoirRefreshAmount: 30,
		// reservoirRefreshInterval: 30 * 1000,
	});

	limiterCamp.on("failed", async (error, jobInfo) => {
		const id = jobInfo.options.id;
		console.warn(`Job ${id} failed: ${error}`);

		console.warn("updating settings");

		//doesn't affect scheduled jobs, so there's always a wait period of continual
		//failures before this kicks in to stop it

		//todo: sort-of worked, still pretty consistent failures
		limiterCamp.updateSettings({
			maxConcurrent: 1, //15
			minTime: 1200, //100
			trackDoneStatus: true,

			reservoir: null,
			reservoirRefreshAmount: null,
			reservoirRefreshInterval: null,
		});

		//retries are NOT re-queued, which makes this wait sort of fucky
		//todo: can I just re-queue?

		if (jobInfo.retryCount === 0) { // Here we only retry once
			console.warn(`Retrying job ${id} in 3000ms!`);
			return 3000;
		}
	});

	const limiterGoogle = new Bottleneck({
		maxConcurrent: 5,
		minTime: 700,
		trackDoneStatus: true
	});

	let wikiPromises = [];
	let fReq = {};

	let spotResults = [];
	let spotFailures = [];
	let wikiResults = [];
	let wikiFailures = [];
	let campResults = [];
	let campFailures = [];
	let bandResults = [];
	let bandFailures = [];
	let scrapeResults = [];
	let scrapeFailures = [];


	//all of these function in a similar manner have the same purpose: get genre info about an artist
	//they are designed to (later) be hit seperately, and therefore expect paramters on body
	//the value that they are passing forward is always just the original fReq that gets passed to search

	//they all (besides search) also check if they need to be ran by asserting existence of a record
	//for that artist in resultCache[wRes.artist.name])

	//they also have the responsibility of deciding the quality of the return value, which if
	//positive will set the value in resultCache

	//todo: searchSpotify currently outputs error flags, search should be detecting quality not searchSpotify

	var search =  function(sReq){
	    return new Promise(function(done, fail) {
			limiterSpotify.schedule(module.exports.searchSpotify,sReq,{})
				.then((sRes) => {
					//success:
					// {	artistSongkick_id: 1111111,artist:<spotifyArtistObject> }

					//couldn't locate
					// "error":true,

					//located but no genres:
					//"error":true, "noGenresFound":true

					//rebind songkickId
					sRes.artist.artistSongkick_id = sReq.body.artist.artistSongkick_id;

					if(!sRes.error){
						resultCache[sRes.artist.name] = sRes;
						spotResults.push(sRes);
					}else{
						spotFailures.push(sRes);
					}

					//note we're always just passing the original query along
					done(sReq)

				}).catch(function(err){
				let error = {artist:wReq.body.artist.name,error:err};
				spotFailures.push(error);
				//console.error(error);
				fail(error)
			});
	    })
	}

	var wiki =  function(wReq){
		return new Promise(function(done, fail) {
			//console.log("wiki...",wReq);

			if(!resultCache[wReq.body.artist.name]){
				limiterWiki.schedule(module.exports.getWikiPage,wReq,{})
					.then((resWiki) => {

						console.log("$wiki",resWiki);
						//todo: decide on threshold
						let wikiThreshold = 1;

						// console.log(resWiki.artist.genres);
						// console.log(resWiki.artist.genres.length > wikiThreshold);
						if(resWiki.artist.genres && resWiki.artist.genres.length > wikiThreshold){
							console.log("WIKI:",wReq.body.artist.name + " " + resWiki.artist.genres);
							resultCache[wReq.body.artist.name] = resWiki;
							wikiResults.push(resWiki);
						}else{
							wikiFailures.push(resWiki)
						}

						done(wReq)

					}).catch(function(err){
					let error = {artist:wReq.body.artist.name,error:err};
					wikiFailures.push(error);

					//todo: should recover from these not just fail out
					fail(error)
				});
			}else{
				done(wReq)
			}
		})
	};

	let campgood = 0;
	var camp =  function(cReq){
		return new Promise(function(done, fail) {
			console.log("camp...",cReq);

				limiterCamp.schedule(module.exports.getCampPage,cReq,{})
					.then((cRes) => {

						console.log("$camp",cRes);
						//console.warn(++campgood + "==========================");

						//todo: decide on threshold
						let campThreshold = 1;

						if(cRes.artist.genres.length > campThreshold){
							console.log("CAMP:",cReq.body.artist.name + " " + cRes.artist.genres);
							resultCache[cReq.body.artist.name] = cRes;
							campResults.push(cRes);
						}else{
							campFailures.push(cRes)
						}
						done(cReq)

					}).catch(function(err){
					let error = {artist:cReq.body.artist.name,error:err};
					console.error(error);
					campFailures.push(error);

					//todo: should recover from these not just fail out
					fail(error)
				});

		})
	};

	var band =  function(bReq){
		return new Promise(function(done, fail) {
			
				//todo: extremely annoying that there is no way to get #1 band result without google'ing

				limiterGoogle.schedule(module.exports.googleQueryBands,bReq,{})
					.then((bRes) => {

						//todo: decide on threshold
						let bandThreshold = 1;

						if(bRes.artist.genres.length > bandThreshold){
							console.log("BAND:",bReq.body.artist.name + " " + bRes.artist.genres);
							resultCache[bReq.body.artist.name] = bRes;
							bandResults.push(bRes);
						}else{
							bandFailures.push(bRes)
						}

						done(bReq)

					}).catch(function(err){
					let error = {artist:wReq.body.artist.name,error:err};
					console.error(error);
					bandFailures.push(error);

					//todo: should recover from these not just fail out
					fail(error)

				});
		})
	};

	var scrape =  function(sReq){
		return new Promise(function(done, fail) {
			//thingsfddsfasdfds
			//console.log("scrape...",bReq.continue);

			if(sReq.continue){
				limiterGoogle.schedule(module.exports.googleQueryScrape,sReq,{})
					.then((sRes) => {


						//started by keeping all the results seperated
						//so that I could do rank-choice later if I wanted to
						//doesn't seem like that will come in too handy atm tho...


						let parsed = [];
						//x is the same cursor b/c titles.length always = descs.length
						for(var x = 0; x < sRes.titles.length; x++){

							let parseLoad = {};
							//parseLoad.artist = payload.artist;
							parseLoad.titles = [];
							parseLoad.descs = [];

							let words = sRes.titles[x].split(" ");
							let words2 = sRes.descs[x].split(" ");

							words.forEach(function(w){
								if(genresMap[w]){
									parseLoad.titles.indexOf(w) === -1 ? parseLoad.titles.push(w):{}
								}
							});

							words2.forEach(function(w){
								if(genresMap[w]){
									parseLoad.descs.indexOf(w) === -1 ? parseLoad.descs.push(w):{}
								}
							});

							//todo: little bit exclusionary

							if(parseLoad.descs.length > 0 || parseLoad.titles.length > 0){
								parsed.push(parseLoad)
							}

						}

						//console.log("$$$PARSED",sRes.artist.name);
						//console.log(JSON.stringify(parsed,null,4));

						let parsedGenres = [];

						parsed.forEach(function(p){
							p.descs.forEach(function(d){
								parsedGenres.indexOf(d) === -1 ? parsedGenres.push(d):{};
							})
							p.titles.forEach(function(t){
								parsedGenres.indexOf(t) === -1 ? parsedGenres.push(t):{};
							})
						})

						//todo: decide on threshold


						//todo:

						let scrapeThreshold = 1;
						let cont = parsedGenres.length < scrapeThreshold;

						let fReq = {};
						fReq.body = {artist: sRes.artist};
						fReq.continue =  cont;

						let payload = {artist: sRes.artist,genres:parsedGenres};

						//console.log("scrape cont",cont);
						cont ? scrapeFailures.push(payload):scrapeResults.push(payload);


						//todo: just checking out failures
						if(cont){
							console.log("$$$",JSON.stringify(sRes,null,4))
						}

						done(fReq)

					}).catch(function(err){
					let error = {artist:wReq.body.artist.name,error:err};
					scrapeFailures.push(error);

					//todo: should recover from these not just fail out
					fail(error)

				});
			}
			else{
				done({continue:false})
			}
		})
	};


	let finish = function(res){

		console.log("finish!");
		//console.log(res);
		console.log(JSON.stringify(resultCache,null,4));
	}

	let mod = 0;
	req.body.artists.forEach(function(ar){
		fReq = {};
		fReq.body = {token:req.body.token};
		fReq.body.artist = ar;

		search(fReq)
			.then(wiki)
			.then(function(wRes){
				//just doll them out equally for now
				let check = mod % 2 ===0;
				mod++;

				if(!resultCache[wRes.body.artist.name]){
					if(check){

						//todo: checks result and if non-acceptable, rotates to other one?
						camp(wRes).then(finish)
					}
					else{
						band(wRes).then(finish)
					}

					//todo: maybe scrape fits here?
					// .then(scrape)
				}
				else{
					finish(wRes)
				}

			})
			.then(finish)
		    .catch(function(err){
			console.error("chain failed for: ",ar.name);
			console.log(err);

		})
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
			totalTime = totalTime + 100;

			// let totalResultsFailures = wikiResults.length +wikiFailures.length +
			// 	campResults.length + campFailures.length +
			// 	bandResults.length + bandFailures.length +
			// 	scrapeResults.length +	scrapeFailures.length;

			let totalFailures = wikiFailures.length +
				campFailures.length +
				bandFailures.length +
				scrapeFailures.length;

			let totalResults = wikiResults.length +
				campResults.length +
				bandResults.length +
				scrapeResults.length;

			let notDone = function(limiter){

				//I guess don't do this? it works sometimes????
				//let cs = JSON.parse(JSON.stringify(limiterWiki.counts()))

				let nots = ["RECEIVED","QUEUED","RUNNING","EXECUTING"]
				let counts = 0;

				nots.forEach(function(t){
					counts = counts  + limiter.jobs(t).length
				});

				return counts > 0;
			};

			//if any of the bottlenecks are not done, continue checking
			let checkIt = notDone(limiterWiki) || notDone(limiterCamp) || notDone(limiterGoogle);

			if(checkIt){

				if(totalTime % 5000 === 0){

					console.log("totalResults/artists",totalResults + "/" + req.body.artists.length);
					console.log("totalFailures",totalFailures);

					console.log("w",wikiResults.length);
					console.log("c",campResults.length);
					console.log("b",bandResults.length);
					console.log("s",scrapeResults.length)
				}

				checkCount()
			}else{
				console.log("getExternalInfos finished execution:",Math.abs(new Date() - startDate) / 600);

				console.log("totalResults/artists",totalResults + "/" + req.body.artists.length);
				console.log("totalFailures",totalFailures);

				console.log("w",wikiResults.length);
				console.log("c",campResults.length);
				console.log("b",bandResults.length);
				console.log("s",scrapeResults.length + " / " + 	scrapeFailures.length);

				//todo:

				// console.log(wikiResultsKeep.length + " wiki results were successful");
				// console.log(googleResults.length + " google results were returned");
				// console.log("FINISHED!",JSON.stringify(wikiResults,null,4));
				// console.log("FINISHED!",JSON.stringify(googleResults,null,4));

				let ret = wikiResults.concat(campResults).concat(bandResults).concat(scrapeResults);
				res.send(ret);
			}
		})
	};

	// setTimeout(function(){
	// 	checkCount();
	// },2000)

	checkCount();

};

//given an artist name and a list of every word in the best-search result,
//can we determine whether the result was what we were actaully looking for?
//if we find that the normalized search result has all of the words in the query
//in it, we say that it is like the query and mark it okay

let getLikeQuery = function(a,s){

	//let print = a === "The Blues Brothers";

	if(a === s){
		return {like: true}
	}
	else {
		let artistName = JSON.parse(JSON.stringify(a));
		let search = JSON.parse(JSON.stringify(s));

		search = search.toLowerCase();

		artistName = artistName.toLowerCase();
		let queryRay = artistName.split(" ");


		// print ? console.log("$$$$",queryRay):{}
		// print ? console.log(search):{}

		let likeQuery = 0;
		queryRay.forEach(function (q) {
			if (search.indexOf(q) !== -1) {
				likeQuery++;
			}
		});

		return {like: likeQuery === queryRay.length, likeQuery: likeQuery, queryRay: queryRay.length};
	}
};


module.exports.searchSpotify = function(req, res){
	return new Promise(function(done, fail) {
		// console.log("search_artists",JSON.stringify(req.body,null,4));
		// console.log("search",req.body.artist.name);
		// console.log("search",req.body.artistSongkick_id);
		let artist = req.body.artist;

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
		let tuple = {};

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
					tuple.artist = {};
					tuple.artist.name = op.displayName;

					if(res.artists.items.length > 0){
						tuple.artist = res.artists.items[0]
						if(tuple.artist.genres.length ===0){
							tuple.error = true;
							tuple.noGenresFound = true;
						}
					}
					else{
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

		//todo: where does the US thing come into play again?
		let nameClean = artist.name.replace(/\(US\)/g, ""); //%20

		//cleaning out non-alphabeticals
		//ex: 'Zoso – the Ultimate Led Zeppelin Experience'
		//that's not a hyphen

		nameClean = nameClean.replace(/[^a-zA-Z\s]/g, ""); //%20

		//todo: clean up input to searchReq
		options.uri = url_pre + nameClean  + url_suf;
		options.artistSongkick_id = req.body.artistSongkick_id;
		options.displayName = artist.name;
		options.displayName_clean = nameClean;

		console.log(options.uri);

		searchReq(options)
			.then(function(result) {
				//console.log(JSON.stringify(result));
				done(result)
				// res.send(result);

			}).catch(function(err){
			let msg = "spotify search artist failure";
			let error = {msg:msg,artist:req.body.artist.name,error:err};
			//console.error(error);
			fail(error)
		})
	})
};

module.exports.getCampPage =  function(req,res){
	return new Promise(function(done, fail) {

		//testing: force artist
		// req.body = {};req.body.artist = {};
		// req.body.artist.name = "Lily Kerbey";

		//console.log("getCampPage",req);

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
			let first = false;

			info.each(function(i,elem){

				//each info has 5 children. we're looking for one of them to contain artist
				//if the info child has 'artist' then we need to examine the info
				let ren = $(this).children()

				ren.each(function(k,elem){
					let t = $(this).text();
					t = t.trim();

					if(t === "ARTIST"){
						//console.log(t,i);
						first === false ? first = i:{};
					}
				})
			});

			//determine whether #1 camp result was what we were actaully looking for

			let spaces = /\s{2}/g;
			let lead_trail = /^\s|\s$/g;

			let htext = $(info[first]).find('.heading').text().replace(spaces,"").replace(lead_trail,"")
			//console.log("$htext",htext);

			let likeQ = getLikeQuery(req.body.artist.name,htext);

			let response = {};
			response.artist = req.body.artist;
			response.artist.genres = []

			if(!likeQ.like){
				console.log("CAMP: closest result wasn't like our query:",likeQ.likeQuery + "/" +likeQ.queryRay);
				console.log(req.body.artist.name + " !like " + htext);

			}else{

				// console.log("like our query:",likeQuery + "/" + queryRay.length);
				// console.log(req.body.artist.name + " like " + t);

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
				if(genres.indexOf(gtext) ===  -1){genres.push(gtext);}
				response.artist.genres = genres;
				//console.log(tup.artist.name + " :" + genres);
			}

			done(response);

		}).catch(function(err){
			let msg = "camp fetch failure";
			let error = {msg:msg,artist:req.body.artist.name,error:err};
			console.error(error);
			fail(error)
		})
	})
};

module.exports.getWikiPage= function(req,res) {

	return new Promise(function(done, fail) {
		//console.log("getWikiPage",req.body.artist);

		let artist = req.body.artist;
		let artist_save = JSON.parse(JSON.stringify(req.body.artist));

		let code_prefix = function (exp) {

			//let exp = "Guns N' Roses";
			//result: Guns_N%27_Roses
			//wiki likes _ for spaces
			//exp = exp.replace(/\s/g, '_');

			//https://www.w3schools.com/tags/ref_urlencode.asp
			exp = encodeURI(exp);

			//not handling apostrophes/single quotes?
			exp = exp.replace("'", "%27");
			return exp;
		};

		//search for an artist
		//https://www.mediawiki.org/wiki/API:Search
		//https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=Kiss%20Musical%20Artist&utf8=&format=json

		let url_pre = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=";
		let url_post = "&utf8=&format=json";

		//testing: force artist
		//let q = "Kiss%20Musical%20Artist";
		//let url = url_pre + q + url_post;

		let url = url_pre + code_prefix(artist.name + " music") + url_post;

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

			//wikipedia will most likely return some kind of musical entity (probably with some genres)
			//when I search like I'm doing. need to make sure the #1 result is somewhere close to where
			//I was trying to get


			let pageid = false;

			if(result.query.search.length > 0){

				//no parsing needed for wikipedia's titles
				let title = result.query.search[0].title;
				let likeQ = getLikeQuery(req.body.artist.name,title);

				if(!likeQ.like){
					console.log("WIKI: closest result wasn't like our query:",likeQ.likeQuery + "/" +likeQ.queryRay);
					console.log(req.body.artist.name + " !like " + title);
				}else{
					pageid = result.query.search[0].pageid
					// console.log("like our query:",likeQuery + "/" + queryRay.length);
					// console.log(req.body.artist.name + " like " + t);
				}
			}
			//console.log("pageid",pageid);

			let response = {};
			response.artist = artist_save;
			//response.artist.genres = [];
			//response.artistSongkick_id = req.body.artistSongkick_id;

			if(pageid){
				//get page id of first search result
				//https://www.mediawiki.org/wiki/API:Parsing_wikitext#Example_1:_Parse_content_of_a_page
				//https://en.wikipedia.org/w/api.php?action=parse&pageid=142238

				let pre = "https://en.wikipedia.org/w/api.php?action=parse&pageid=";
				let post = "&format=json&prop=text";
				let url = pre + pageid + post;

				let options = {
					method: "POST",
					uri: url,
					headers: {
						'User-Agent': 'Request-Promise',
						// "Content-Type": "jsonp"
					},
					//json: true
				};

				//console.log("URL",url);

				rp(options).then(function (result) {
					result = JSON.parse(result);
					//console.log("res", JSON.stringify(result,null,4));

					let page = result.parse.text["*"];
					let genres = $(page).find("th:contains('Genres')").next().text();

					let pat = /\n/g;
					genres = genres.replace(pat,",");

					if(genres.indexOf(",") !== -1){
						genres = genres.split(",");
					}
					//assuming no split means single-item list
					else{genres = [genres]}

					//split from above will produce some "" b/c of newlines and such

					function removeDupsCaps(records) {
						let unique = {};
						records.forEach(function(i) {
							i = i.toLowerCase();
							if(!unique[i]) {
								if(i !== ""){
									unique[i] = true;
								}
							}

						});
						return Object.keys(unique);
					}

					response.artist.genres = removeDupsCaps(genres);
					done(response)
					//res.send(response)

				}).catch(function (err) {
					console.log("secondary wiki request failure");
					console.log(err);
					fail(err)
				})
			}
			else{
				done(response)
				//res.send(response)

			}
		}).catch(function (err) {
			console.log("primary wiki request failure");
			console.log(err);
			fail(err)
		})

	})//promise
};

module.exports.getWikiPage_deprecated = function(req,res) {

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
				let pat = /\[\[([A-Za-z\s\|]*)\]\]/gs;

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

let doOne = true;

module.exports.googleQueryBands = function(req,res) {
	//console.log("googleQuery",req.body.artist.name);

	return new Promise(function(done, fail) {

		var optionsBands = {
			query: req.body.artist.name + "bandsintown",
			host: 'www.google.com',
			// lang: 'fr',
			// age: 'd1', // last 24 hours ([hdwmy]\d? as in google URL)
			limit: 2,

			//testing: anytime captcha is failing, enable this temporarily
			//solver:dbc,
			params: {} // params will be copied as-is in the search URL query string
		};

		let urls = [];
		var scrape =  function(){
			return new Promise(function(done, fail) {
				//this SHOULD be called once per result, but my 'limit' on scrape isn't working sooo
				scraper.search(optionsBands, function(err, url,meta) {
					if(err){
						console.log("HERE!");
						console.log(err);
						//fail(err)
					}

					urls.push(meta.url);
					if(urls.length === 10){
						console.log(urls[0]);
						done(urls[0])
					}
					// else{console.log(urls.length);}

				})
			})};

		scrape()
			.then(function(){

				let options = {
					method: "GET",
					uri: urls[0],
					headers: {
						'User-Agent': 'Request-Promise',
					},
					//json: true
				};

				rp(options)
					.then(function (result) {

						let tuple = {};
						tuple.artist = req.body.artist;
						tuple.artist.genres = [];

						let parseBandHTML = function(html,artist){

							//console.log("parseBandHTML",html);
							let doc = $(html);

							//determine whether or not the result is what we're looking for

							var hs = doc.find("[class^='artistInfo']")
							let str = "";
							let headers = [];

							$(hs).each(function(k,elem){

								let h2 = $(this).find("h1")
								let t = $(h2).text();
								if(t !== "" && headers.indexOf(t) === -1){
									headers.push(t)
								}
							});

							//console.log("headers:",headers);

							if(headers.length > 0){

								//todo: need this?

								// let spaces = /\s{2}/g;
								// let lead_trail = /^\s|\s$/g;
								// let htext = $(info[first]).find('.heading').text().replace(spaces,"").replace(lead_trail,"")

								//todo: not sure header behavior, whether I can just trust the one unique? that is present

								let htext = headers[0];
								let likeQ = getLikeQuery(req.body.artist.name,htext);

								if(!likeQ.like) {
									console.log("BAND: closest result wasn't like our query:", likeQ.likeQuery + "/" + likeQ.queryRay);
									console.log(req.body.artist.name + " !like " + htext);

								}else{

									var gs = doc.find("[class^='artistBio']")
									$(gs).each(function(k,elem){

										//console.log($(this).text())
										let getN = $(this).text() == 'Genres: '
										if(getN){
											//console.log("str",$(this).next().text())
											str = $(this).next().text();
										}
									})

									let genres = [];
									if(str) {
										if (str.indexOf(",") !== -1) {
											genres = str.split(",")
										}else{
											//console.warn("if this is >1 genre, there was an issue on split:",str);
											genres.push(str);
										}
									}

									//todo: split funny genres

									//examples from https://www.bandsintown.com/en/a/12732676-funk-worthy
									// R&b/soul, R&b, Rock, Soul, Rnb-soul, Fusion, Funk

									let sGenres = [];
									genres.forEach(function(g){
										g = g.trim().toLowerCase();

										if(g.indexOf("/") !== -1){
											let sp = g.split("/");
											sp.forEach(function(s){
												sGenres.push(s)
											})
										}
										else{
											sGenres.push(g)
										}
									});
									tuple.artist.genres = sGenres;
								}

							}else{
								console.log("no results? on bandcamp for ",req.body.artist.name);
							}
							return tuple;
						};

						done(parseBandHTML(result,req.body.artist))

					}).catch(function(err){
					let msg = "band FETCH failure"
					let error = {msg:msg,artist:req.body.artist.name,error:err};
					console.error(error);
					fail(error)
				})

			}).catch(function(err){
			let msg = "band SCRAPE failure"
			let error = {msg:msg,artist:req.body.artist.name,error:err};
			console.error(error);
			fail(error)
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
};

module.exports.googleQueryScrape  = function(req,res) {
	//console.log("googleQuery",req.body.query);

	return new Promise(function(done, fail) {

		var optionsScrape = {

			//todo: not sure exactly what to do with query here

			query: req.body.artist.name + "music",
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

			//todo: handle  these callbacks as promises on failure
			if(err){fail(err)}

			//console.log(url)
			titles.push(meta.title);
			descs.push(meta.desc);

			if(titles.length === 10){
				//console.log("$SCRAPE");
				// console.log(titles);
				// console.log(descs);
				let payload = {titles:titles,descs:descs,artist:req.body.artist};
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

		//testing: skip actual calls
		//promises.push(promiseThrottle.add(searchReq.bind(this,options)));

		// .then(function(res) {
		// 	console.log("done",res);
		// })
	});

	Promise.all(promises)
		.then(function(results) {
			//console.log(JSON.stringify(results,null,4));
			console.log("search_artists finished execution:",Math.abs(new Date() - startDate) / 600);
			console.log("FINISHED");

			//testing: skip actual calls

			// console.warn("skipped actual calls, results are all errors");
			// results = [];
			// req.body.perfTuples.forEach(function(tup){
			// 	let r = {};
			// 	r.artistName = tup.displayName;
			// 	r.artistSongkick_id = tup.artistSongkick_id;
			// 	r.error = true;
			// 	results.push(r)
			// });

			res.send(results);
		}).catch(function(err){
		console.log(err);
	})
};

//module.exports.make_request_simple.type = "POST"