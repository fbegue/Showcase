//var request = require('request'); // "Request" library
var PromiseThrottle = require("promise-throttle");
var rp = require('request-promise');
var google = require('google');
var scraper = require('google-search-scraper');
var Bottleneck = require("bottleneck");
var $ = require('cheerio');


// const Browser = require('zombie');
// //testing:
// Browser.waitDuration = '30s';

const colors = require('colors/safe');
console.error = function(msg){console.log(colors.red(msg))};
console.warn = function(msg){console.log(colors.yellow(msg))};
console.good = function(msg){console.log(colors.green(msg))};
console.log("colors configured");

//scrapeSongkick-------------------------------------------------------

var songkick = require("./songkick.js");

//example input

var getMetroEventsReq = {
	"metro": {
		"displayName": "Columbus",
		"id": 9480
	},
	"dateFilter": {
		"start": "2019-11-02",
		"end": "2019-11-30"
	},
	"raw_filename": "raw_Columbus_2019-09-07-2019-09-14.json",
	"areaDatesArtists_filename": "areaDatesArtists_Columbus_2019-09-07-2019-09-14.json"
}

let scrapeSongkick = function(){

	songkick.get_metro_events_local({body:getMetroEventsReq})
		.then(function(res){

			//stripped down (no ala stuff) version of promise return function from spotify.js call to get_metro_events

			let events = res.data;
			//console.log("get_metro_events results",JSON.parse(JSON.stringify(events)));
			console.log("get_metro_events events length:",events.length);

			let artist_search_payload = [];
			let pushedIds = [];

			events.forEach(function(event){

				let tuple = {};

				event.performance.forEach(function(perf){

					//we will process these and update our table in a sec
					if(pushedIds.indexOf(perf.artist.id) === -1){
						tuple = {};
						tuple.name = perf.artist.displayName;

						//int id convention
						//tuple.artistSongkick_id = perf.artist.id;
						tuple.id = perf.artist.id;

						//this is an array? but we'll just assume 1st-value-valid
						//perf.artist.identifier.length > 1 ? console.error("MULTIPLE IDENTIFIERS",perf.artist):{};
						//perf.artist.identifier.length === 0 ? console.error("missing identifier",perf.artist):{};

						perf.artist.identifier.length > 0 ? tuple.identifier = perf.artist.identifier[0].mbid:{};

						//todo: doesn't seem like this is a thing anymore?
						//I checked to make sure I wasn't parsing it out or anything,
						//I just dont see it coming back on any perf.artist
						// tuple.onTourUntil

						artist_search_payload.push(tuple);
						pushedIds.push(perf.artist.id)
					}
				}); //each performance
			}); //each event



			//testing:
			//artist_search_payload = artist_search_payload.slice(0,4);
			//console.log("getInfos payload",artist_search_payload);
			console.log("getInfos payload size",artist_search_payload.length);

			var token = "BQD3HB7yNlEoTm2mkaTj29Z2CVIvChpKXTa3BiCCgJHNhUlkzhf8SmSooNTiNbezNXBzq3Ys5LTZryNCRXdQ-q62EpHzP2A2ptvXk3ssHudcPXOLpe9KwJ5AWGR66ZQg8QRVaXXSpadM7joVzgK3F4j1W2BW1d8w5O2yiSu3JoAFr6lV2HNU20LP7Li68Wab2pgFczepcJlgvaefTd68EwryGeRE2yjAlxOoOKIk16Uj8hHWKVIzn6Ajp17AApgnU9LMuAyImxX0fMlyOd3G2u7VcH5QNg"


			var commitAllArtistsSongkick = function(artist_search_payload){

				console.log("commitAllArtistsSongkick");

				artist_search_payload.forEach(function(ar){

					//upsert
					let insert_artistSongkick = function (artist) {

						var sreq = new sql.Request(poolGlobal);

						sreq.input("id", sql.Int, artist.id);
						sreq.input("identifier", sql.VarChar(150), artist.identifier);

						//todo: apparantly songkickArtists can have names too???? wtf
						sreq.input("displayName", sql.VarChar(100), artist.displayName || artist.name);

						//this isn't a 'look' this is just preliminary recording
						sreq.input("lastLook", sql.DateTimeOffset(7),null);

						sreq.execute("insert_artistSongkick").then(function (res) {
							//console.log(res);
						}).catch(function (err) {
							console.log(err);
						})

					};

					insert_artistSongkick(ar)

				});

			};

			commitAllArtistsSongkick(artist_search_payload);

			console.log("commitAllArtistsSongkick finished");

			module.exports.getInfos_local({body:{artists:artist_search_payload,token:token}})
				.then(function(){

					//todo:
					//console.log("getInfos results:",JSON.parse(JSON.stringify(res.data)));

				});//getInfos

		});//get_metro_events

}

//scrapeSongkick();



var artist_artistSongkickScript = function(){
	var sreq = new sql.Request(poolGlobal);
	var qry = "select a.id as artist_id, aso.id as artistSongkick_id from dbo.artists a join dbo.artistsSongkick aso on aso.displayName = a.name";

	sreq.query(qry)
		.then(function(rlts){
			rlts.recordset.forEach(function(r){
				//console.log(r);

				var sreq2 = new sql.Request(poolGlobal);

				sreq2.input("artist_id", sql.VarChar(150), r.artist_id);
				sreq2.input("artistSongkick_id",sql.Int, r.artistSongkick_id);
				var qry2 = "insert into artist_artistSongkick(artist_id, artistSongkick_id) values (@artist_id, @artistSongkick_id)";
				sreq2.query(qry2).then(function(rlts2){
					//console.log("rlts2",rlts2);
				})
			});
		});


};

setTimeout(function(){
	//artist_artistSongkickScript();
},2000)

//UI Endpoints-------------------------------------------------------

//todo: get this from another source
let all_genres = require('./public/all_genres2');

let genresMap = {};
//console.log("$all_genres",all_genres.all_genres);

all_genres.all_genres.forEach(function(t){
	genresMap[t.name] = "dum"
});


let resultCache = {};

const MusicbrainzApi = require('musicbrainz-api').MusicBrainzApi;

//todo: clear out cruft in config

const mbApi = new MusicbrainzApi({
	appName: 'Showcase',
	appVersion: '0.1.0',
	appMail: 'eugene.f.begue@gmail.com',

	//baseUrl: 'https://musicbrainz.org',
	baseUrl: 'http://localhost:8080',

	// Optional, default: no proxy server
	// proxy: {
	// 	host: 'localhost',
	// 	port: 8080
	// },
});


//query=artist:queen%20AND%20type:group&fmt=json

let testBrainz = function(){

	let pErr = function(err){console.error(err)};

	mbApi.searchArtist('Queen')
		.then(function(result){
			//console.log("$searchArtist",JSON.stringify(result,null,4));
			console.log(JSON.stringify(	result["artist-list"].artist[0],null,4))

		}).catch(pErr);

	// mbApi.search('artist', 'Queen')
	// 	.then(function(result){
	// 		console.log("$artist",JSON.stringify(result,null,4));
	// 	}).catch(pErr);


	// let artist = "Queen";
	//
	// const query = 'query="Queen" AND type:group';
	//
	// mbApi.search('artist', query)
	// 	.then(function(result){
	// 		console.log("$artistType=group",JSON.stringify(result,null,4));
	// 	}).catch(pErr);


	//todo: test of strength

	// let ps = []
	// for(var x = 0; x < 1000;x++){
	//ps.push(mbApi.search('artist', query))
	//}


	// Promise.all()
	//...

};

//testBrainz();



let sql = require("mssql")

//troubleshooting connection to localhost
//https://stackoverflow.com/questions/25577248/node-js-mssql-tedius-connectionerror-failed-to-connect-to-localhost1433-conn

var config = {
	"user": 'test',
	"password": 'test',
	"server": 'DESKTOP-TMB4Q31\\SQLEXPRESS',
	"database": 'master',
	"port": '61427',
	"dialect": "mssql",
};

let conn = {};
let poolGlobal = {};

module.exports.poolGlobal = poolGlobal;


//todo: check if connetions are alive and get new/existing ones

var getConnect =  function(){
	return new Promise(function(done, fail) {


	})
};

let runSQLTests = function(){


	sql.connect(config).then(pool => {
		poolGlobal = pool;
		conn = pool.request();
		return conn.query("select getdate();")
	})
		.then(result => {
			console.log("connected @ ",result)

			let tDate = new Date();
			let strDate = tDate.toISOString();

			// var vlist = Object.values(update).map(function(value){
			// 	if(value === null){
			// 		return null
			// 	}else{
			// 		return "'" + value + "'"
			// 	}
			//
			// }).join(",");

			let insert_artistsSongkick  = function(){
				//console.log("insert_artistsSongkick");

				let a = {
					id:4,
					displayName:"testDisplayName",
					identifier:"test-mbei-233r-asfsdf-dfdsasfd",
					//onTourUntil:strDate
				};

				var keys = Object.keys(a);
				var klist = keys.map(function(value){
					return "" + value + ""
				}).join(",");
				var kparams = keys.map(function(value){
					return "@" + value + ""
				}).join(",");

				var sreq = new sql.Request(poolGlobal);
				sreq.input("id", sql.Int, a.id);
				sreq.input("displayName", sql.VarChar(100), a.displayName);
				sreq.input("identifier", sql.VarChar(150), a.identifier);

				//todo: sreq.input("onTourUntil", sql.DateTimeOffset(7), as.onTourUntil)

				var qry = "IF NOT EXISTS (SELECT * FROM dbo.artistsSongkick WHERE id = @id)"
					+ " INSERT INTO dbo.artistsSongkick("+ klist + ")"
					+ " OUTPUT inserted.id, inserted.displayName, inserted.identifier"
					+ " VALUES(" + kparams +")"
					+ " else select * from dbo.artistsSongkick WHERE id = @id";

				sreq.query(qry).then(function(res){
					console.log(res);
				}).catch(function(err){
					console.log(err);
				})

			};

			//insert_artistsSongkick();

			let insert_artist  = function(){
				//console.log("insert_artistsSongkick");

				let a = {
					id:"052uQIm9OdFVUpsXaIXS7p",
					name:"testName",
					uri:"spotify:track:4aOy3Z4SaX3Mh1rJGh2HLz",
					//onTourUntil:strDate
				};

				var keys = Object.keys(a);
				var klist = keys.map(function(value){
					return "" + value + ""
				}).join(",");
				var kparams = keys.map(function(value){
					return "@" + value + ""
				}).join(",");

				var sreq = new sql.Request(poolGlobal);
				sreq.input("id",  sql.VarChar(50), a.id);
				sreq.input("name", sql.VarChar(50), a.name);
				sreq.input("uri", sql.VarChar(100), a.uri);

				//todo: sreq.input("onTourUntil", sql.DateTimeOffset(7), as.onTourUntil)

				var qry = "IF NOT EXISTS (SELECT * FROM dbo.artists WHERE id = @id)"
					+ " INSERT INTO dbo.artists("+ klist + ")"
					+ " OUTPUT inserted.id, inserted.name, inserted.uri"
					+ " VALUES(" + kparams +")"
					+ " else select * from dbo.artists WHERE id = @id";

				sreq.query(qry).then(function(res){
					console.log(res);
				}).catch(function(err){
					console.log(err);
				})

			};

			//insert_artist();

			let insertGenre = function(){
				console.log("insertGenre");
				var genre = "Country";
				var sreq = new sql.Request(poolGlobal);
				var qry = "IF NOT EXISTS (SELECT * FROM dbo.genres WHERE name = @name) " +
					"INSERT INTO dbo.genres(name) OUTPUT inserted.id, inserted.name VALUES(@name) " +
					"else select * from dbo.genres WHERE name = @name";
				sreq.input("name", sql.VarChar(255), genre);
				sreq.query(qry).then(function(res){
					console.log(res);
				}).catch(function(err){
					console.log(err);
				})
			};

			//insertGenre();

			let insert_genre_artist = function(){
				console.log("insert_genre_artist");

				//todo: NOT SURE about decision to mix formats for artist_id here
				//songkick's numeric ids always treated as strings

				var g = {
					id:"1",
					name:"rock"
				};

				var a_songkick ={
					id:"253846"
				}

				var a_spotify ={
					id:"1CD77o9fbdyQFrHnUPUEsF"
				};

				//todo: check if I need to encode incoming numeric artist id from songkick
				// let artist = a_songkick;
				let artist = a_spotify;

				if(typeof artist.id === "integer"){
					artist.id = artist.id.toString();
				}

				//multi-object doesn't make sense to use k-extraction
				var klist = "genre_id,artist_id"
				var kparams = "@genre_id,@artist_id"

				var sreq = new sql.Request(poolGlobal);
				sreq.input("genre_id", sql.Int, g.id);
				sreq.input("artist_id", sql.VarChar(50), artist.id);
				var qry = "IF NOT EXISTS (SELECT * FROM dbo.genre_artist WHERE genre_id = @genre_id and artist_id = @artist_id)"
					+ " INSERT INTO dbo.genre_artist(" + klist + " )"
					+ " OUTPUT inserted.genre_id, inserted.artist_id"
					+ " VALUES(" + kparams + ")"
					+ " else select * from dbo.genre_artist WHERE genre_id = @genre_id and artist_id = @artist_id";

				sreq.query(qry).then(function(res){
					console.log(res);
				}).catch(function(err){
					console.log(err);
				})
			};

			//insert_genre_artist();

			//todo: not sure about closing this
			//sql.close();

		}).catch(err => {console.log(err)});

};

runSQLTests();

const Nightwatch = require('nightwatch');



//todo: attempt to pass parameters to test via settings.global
// https://libupdate.com/libs/6b0b60cc-1a1e-4f88-b45b-d5d1f24ad96a (search 'programatic API')

//appears to be easy as shit with 'runTests'

// never got to work: Error: An error occurred while retrieving a new session: "Connection refused to 127.0.0.1:9515".
// when looking for advice, told to use CLI instead, which doesn't appear to let you pass settings
// https://github.com/nightwatchjs/nightwatch/issues/1954
// https://github.com/nightwatchjs/nightwatch/issues/1919


var settings = {
	"src_folders" : ["tests"],

	"webdriver" : {
		"start_process": true,
		"-server_path": "node_modules/.bin/chromedriver",
		"--server_path": "./node_modules/chromedriver/lib/chromedriver",
		"port": 9515
	},

	"test_settings" : {
		"default" : {
			"desiredCapabilities": {
				"browserName": "chrome",
				"javascriptEnabled": true,
				"acceptSslCerts": true,
				"chromeOptions" : {
					"args" : ["headless", "no-sandbox", "disable-gpu"]
				}
			}
		}
	}
};
//
// try{
// 	console.log("runTests");
// Nightwatch.runTests('./tests', settings)
// 	.then(function() {
// 		console.log("finished!");
//
// 	}).catch(function(err) {
// 	// An error occurred
// });
//
// }catch(e){
// 	console.log(e);
// }

//todo: tried with .runner instead, same issues? can't remember
//https://stackoverflow.com/questions/43817893/passing-command-line-arguments-to-nightwatch-runner

//Nightwatch.runner(argv, done, settings);


//todo: advice on passing globals via commandline
//haven't really looked into this one, could be promising
// https://github.com/nightwatchjs/nightwatch/issues/498


let funk = {
	id:99999,
	name:"Funk Worthy",
	identifier:"test-mbei-233r-asfsdf-dfdsasfd",
};

let MercyMe = {
	id:99998,
	name:"MercyMe",
	identifier:"test2-mbei-233r-asfsdf-dfdsasfd",
}



//todo: need to figure out elegant solution for the use case I have here
//of running multiple tests in parallel...

//  where the driver is the same (can't just spawn a new one for each query)
//  where I can continue to call with my artist parameter (which is janky as it is)

let stress = function(num){

	// for(var x = 0; x < num; x++){
	// 	bandTest(funk);
	// }

	//bandTest(funk,"default");
	bandTest(MercyMe,"default");
}

//stress(10);

let limiterSpotify;
let limiterWiki;
let limiterCamp;
let limiterBand;
let limiterGoogle;

let limiters = function(){
	//todo: 10 per second
	limiterSpotify = new Bottleneck({
		maxConcurrent: 10,
		minTime: 100,
		trackDoneStatus: true
	});

	limiterWiki = new Bottleneck({
		maxConcurrent: 15,
		minTime: 100,
		trackDoneStatus: true
	});

	//todo: optimize
	limiterBand = new Bottleneck({
		maxConcurrent: 1,
		minTime: 300,
		trackDoneStatus: true,
	});

	limiterCamp = new Bottleneck({
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

	limiterGoogle = new Bottleneck({
		maxConcurrent: 5,
		minTime: 700,
		trackDoneStatus: true
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
}
limiters()


//testing:
let executeOnce = false;
let runsMagic =5

module.exports.getInfos  = function(req,res,next) {
	console.log("getInfo input artists length:",req.body.artists.length);
	//console.log("getInfo",req.body.token);


	//todo: reduce workset
	//testing
	//console.warn("WORKING WITH REDUCED SET");
	//req.body.artists = req.body.artists.splice(100,200)

	var lastFail = {};
	var lastRan = false;

	var checkProms = [];
	var filteredPayload = [];
	var alreadyHave = [];

	var checkDBForArtist =  function(artist){
		return new Promise(function(done, fail) {

			//console.log("in",artist.id);
			//console.log("qry",qry);

			var sreq = new sql.Request(poolGlobal);
			sreq.input("artistId", sql.VarChar(50), artist.id);

			sreq.execute("checkForArtistGenres").then(function(res){
				if(res.recordset.length > 0){

					//we're fetching artist join on genres.

					//if lastLook isnt but there IS a record populated, we recorded a failure at some point in the past, skip this
					//todo: make this a time-sensitive expiration (when we have more than 1 service to feed from)

					if(res.recordset[0].lastLook !== null){
						var oneNull =res.recordset[0];
						console.log("",oneNull.displayName + " lastLook: " + oneNull.lastLook);
						alreadyHave.push(artist)
					}
					//if there's only 1 row and the genres null, we have a record but no genres
					else if(res.recordset.length === 1 && res.recordset[0].genreName === null){
						filteredPayload.push(artist)
					}
					//we have genres. record them in the return cache
					else{
						artist.genres = [];
						res.recordset.forEach(function(match){
							artist.genres.push(match["genreName"])
						});

						//these were genre-joins, so pick any record for artist info
						artist.name = res.recordset[0].displayName || res.recordset[0].name
						artist.identifier = res.recordset[0].identifier;
						artist.id = res.recordset[0].id;

						resultCache[artist.name] = {artist:artist};
						alreadyHave.push(artist)
					}
				}
				//we've never seen this id before
				else{
					//console.log("push");
					filteredPayload.push(artist)
				}
				done();

			}).catch(function(err){
				console.log("checkDBForArtist failure",err);
				fail(err)
			})

		})
	};

	req.body.artists.forEach(function(artist){
		checkProms.push(checkDBForArtist(artist));
	});

	Promise.all(checkProms).then(function(results){

		//console.log("many queries",JSON.stringify(results,null,4));
		//console.log("many queries results");
		// results.forEach(function(r){
		// 	console.log(JSON.stringify(r.recordset,null,4));
		// });


		//console.error("STOPPED EXECUTION");
		//req.body.artists = [];

		//console.error("RECUDED SET");
		//req.body.artists = req.body.artists.slice(0,req.body.artists.length -199);
		console.log(req.body.artists);

		console.log("skipping getinfo for" + alreadyHave.length);
		console.log("executing getinfo for" + filteredPayload.length);

		//console.log("filteredPayload:",JSON.stringify(filteredPayload,null,4));
		console.log("total skipped:" + alreadyHave.length + "/" + req.body.artists.length);

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

		//todo: searchSpotify currently outputs error flags when this search function should be detecting quality - not searchSpotify
		//todo: catch and quickly exit when token is expired

		//search spotify by artist's displayName string from songkick
		//if we get a good result back, insert into insert the artist and its songkick linking
		//record into the db

		var search =  function(sReq){
			return new Promise(function(done, fail) {
				limiterSpotify.schedule(module.exports.searchSpotify,sReq,{})
					.then((sRes) => {

						//todo: assuming these artists are coming fron songkick
						//the id here will be a songkick on then
						sRes.artist.artistSongkick_id = sReq.body.artist.id;

						//console.log("sReq",JSON.stringify(sReq,null,4));
						//console.log("sRes",JSON.stringify(sRes,null,4));

						//located
						if(sRes.artist.id){

							//console.log("located",sRes.body.artist);

							let insert_artist_artistSongkick = function(artist){
								var sreq2 = new sql.Request(poolGlobal);
								sreq2.input("artist_id", sql.VarChar(150), artist.id);
								sreq2.input("artistSongkick_id",sql.Int, artist.artistSongkick_id);
								sreq2.execute("insert_artist_artistSongkick").then(function(rlts2){
									//console.log("insert_artist_artistSongkick: ",rlts2);
								})
							};

							insert_artist_artistSongkick(sRes.artist);

							let insert_artist = function (artist) {

								//console.log("spotify artist:", artist);

								var sreq = new sql.Request(poolGlobal);
								sreq.input("id", sql.VarChar(50), artist.id);
								sreq.input("name", sql.VarChar(50), artist.name);
								sreq.input("uri", sql.VarChar(100), artist.uri);
								sreq.input("lastLook", sql.DateTimeOffset(7), new Date());

								sreq.execute("insert_artist").then(function (res) {
									//console.log(res);
								}).catch(function (err) {
									console.log(err);
								})

							};

							insert_artist(sRes.artist);

							//located w/ genres
							if(sRes.artist.genres){
								//console.log("located w/ genres",sRes.artist);

								var qualGenres = [];

								var insertGenre = function (genre) {
									return new Promise(function (done, fail) {
										var sreq = new sql.Request(poolGlobal);
										var qry = "IF NOT EXISTS (SELECT * FROM dbo.genres WHERE name = @name) " +
											"INSERT INTO dbo.genres(name) OUTPUT inserted.id, inserted.name VALUES(@name) " +
											"else select * from dbo.genres WHERE name = @name";
										sreq.input("name", sql.VarChar(255), genre);
										sreq.query(qry).then(function (res) {
											// let rec = JSON.parse(res.recordset[0])
											//console.log(res.recordset[0]);
											//sRes.artist.genres.push(res.recordset[0]);
											qualGenres.push(res.recordset[0]);
											done();

										}).catch(function (err) {
											console.log(err);
											fail(err);
										})
									})
								};

								let insert_genre_artist = function (genre, artist) {
									//console.log("insert_genre_artist");

									//todo: NOT SURE about decision to mix formats for artist_id here
									//songkick's numeric ids always treated as strings

									//todo: check if I need to encode incoming numeric artist id from songkick
									if (typeof artist.id === "number") {
										artist.id = artist.id.toString();
									}


									//multi-object doesn't make sense to use k-extraction
									var klist = "genre_id,artist_id"
									var kparams = "@genre_id,@artist_id"

									var sreq = new sql.Request(poolGlobal);
									sreq.input("genre_id", sql.Int, genre.id);
									sreq.input("artist_id", sql.VarChar(50), artist.id);

									var qry = "IF NOT EXISTS (SELECT * FROM dbo.genre_artist WHERE genre_id = @genre_id and artist_id = @artist_id)"
										+ " INSERT INTO dbo.genre_artist(" + klist + " )"
										+ " OUTPUT inserted.genre_id, inserted.artist_id"
										+ " VALUES(" + kparams + ")"
										+ " else select * from dbo.genre_artist WHERE genre_id = @genre_id and artist_id = @artist_id";

									sreq.query(qry).then(function (res) {
										//console.log(res);
									}).catch(function (err) {
										console.log(err);
									})
								};

								let gPromises = [];
								let gaPromises = [];

								sRes.artist.genres.forEach(function (genre) {
									gPromises.push(insertGenre(genre))
								});

								Promise.all(gPromises).then(function () {

									//console.log("insertGenre finished");
									//console.log("starting insert_genre_artist", sRes.artist);
									///console.log("starting qualGenres", qualGenres)

									qualGenres.forEach(function (genre) {
										gaPromises.push(insert_genre_artist(genre, sRes.artist));
									});

									Promise.all(gaPromises).then(function () {
										//console.log("insert_genre_artist finished");

										//client.end()
									})
								});

							}
							//located no genres
							else{
								//console.log("located no genres",sReq.body.artist);
							}

							//always return results to cache if we found a record
							resultCache[sRes.artist.name] = sRes;
							spotResults.push(sRes);
						}
						//no spotify record
						else{
							//console.log("no spotify record",sReq.body.artist);
							spotFailures.push(sRes);
						}

						// if(!sRes.error){
						// 	resultCache[sRes.artist.name] = sRes;
						// 	spotResults.push(sRes);
						// }else{
						// 	spotFailures.push(sRes);
						// }

						//note we're always just passing the original query along

						sReq.genres = sRes.artist.genres || [];
						done(sReq)

					}).catch(function(err){
					let error = {artist:sReq.body.artist.name,error:err};
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
								console.good("WIKI:",wReq.body.artist.name + " " + resWiki.artist.genres);
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
				//console.log("camp...",cReq);

				limiterCamp.schedule(module.exports.getCampPage,cReq,{})
					.then((cRes) => {

						//console.log("$camp",cRes);
						//console.warn(++campgood + "==========================");

						//todo: decide on threshold
						let campThreshold = 1;

						if(cRes.artist.genres.length > campThreshold){
							console.good("CAMP:",cReq.body.artist.name + " " + cRes.artist.genres);
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


		let runCount = 0;
		var band =  function(bReq){
			return new Promise(function(done, fail) {

				//todo: changed to take in an array of artists

				//{expiration:30000},
				limiterBand.schedule(module.exports.getBandPage,bReq,{})
					.then((bRes) => {

						//todo: unlike other getInfo tools, getBandPage can't (yet?) return actual results b/c theres
						//no way to pass back data from the test - so our pass/fail here is going to be to see if the DB
						//got information added to it for that artist id

						console.log("$bReq",bReq);
						console.log("#artists",bReq.artists.length);

						var valPromises = []
						bReq.artists.forEach(function(artist){

							//todo: not managing sql connetions well, so this fails here
							//therefore, need to test code under here properly

							var sreq = new sql.Request(poolGlobal);

							var qry = "select aso.id,aso.displayName,aso.identifier,g.name as genreName" +
								" from artistsSongkick aso "
								+ " left join genre_artist ga on aso.id = ga.artist_id"
								+ " left join genres g on ga.genre_id = g.id"
								+ " left join artists a on a.id = ga.artist_id"
								+ " where  aso.id = cast(@artistId  as int) or a.id = @artistId";
							sreq.input("artistId", sql.VarChar(50), artist.id);

							//console.log("in",artist.id);
							//console.log("qry",qry);
							valPromises.push(sreq.query(qry));
						}); //bReq.artists each

						Promise.all(valPromises).then(function(results){

							//console.log("many queries",JSON.stringify(results,null,4));
							console.log("many queries results");
							results.forEach(function(r){
								console.log(JSON.stringify(r.recordset,null,4));
							});

							bRes = {};
							bRes.artists = [];
							var artist = {}

							results.forEach(function(res){

								artist = {};
								artist.genres = []

								if(res.recordset.length > 0){
									res.recordset.forEach(function(match){
										artist.genres.push(match["genreName"])
									});

									//these were genre-joins, so pick any record for artist info
									artist.name = res.recordset[0].displayName;
									artist.identifier = res.recordset[0].identifier;
									artist.id = res.recordset[0].id;

									bRes.artists.push(artist)
								}
								else{
									//todo: POE failed somehow for this artist
									//but we've given ourselves no way to identify whose a failure occured for
									console.error("failed for an artist?? yah alright this won't work");
								}

							}); //forEach

							console.log("bres",JSON.stringify(bRes,null,4));

							//todo: decide on threshold
							let bandThreshold = 1;

							bRes.artists.forEach(function(artist){
								if(artist.genres.length > bandThreshold){
									console.log(JSON.stringify(artist,null,4));
									console.good({"BAND":artist.name + " " + artist.genres});

									//todo: kind of forgot about this, need to match spotify results

									resultCache[artist.name] = {artist:artist};
									bandResults.push({artist:artist});
								}else{
									console.log("failure",artist);
									bandFailures.push(artist)
								}
							})

						}); //promise all

						//  var sreq = new sql.Request(poolGlobal);
						//
						// var qry = "select * from artistsSongkick aso "
						// 	+ " left join genre_artist ga on aso.id = ga.artist_id"
						// 	+ " left join genres g on ga.genre_id = g.id"
						// 	+ " left join artists a on a.id = ga.artist_id"
						// 	+ " where  aso.id = cast(@artistId  as int) or a.id = @artistId";
						// sreq.input("artistId", sql.VarChar(50), bReq.body.artist.id);
						//
						// console.log("in",bReq.body.artist.id);
						// console.log("qry",qry);
						//
						// sreq.query(qry).then(function(res){
						// 	console.log(res.recordset);
						//
						// 	let genres = [];
						// 	res.recordset.forEach(function(match){
						// 		genres.push(match["name"])
						// 	});
						//
						// 	bRes = {};
						// 	bRes.artist = bReq.body.artist;
						// 	bRes.artist.genres = genres;
						//
						// 	//todo: decide on threshold
						// 	let bandThreshold = 1;
						//
						// 	if(res.recordset.length > bandThreshold){
						// 		console.good("BAND:",bReq.body.artist.name + " " + bRes.artist.genres);
						// 		resultCache[bReq.body.artist.name] = bRes;
						// 		bandResults.push(bRes);
						// 	}else{
						// 		bandFailures.push(bRes)
						// 	}
						//
						// }).catch(function(err){
						// 	console.log(err);
						// });


						// if(bRes.artist.genres.length > bandThreshold){
						// 	console.good("BAND:",bReq.body.artist.name + " " + bRes.artist.genres);
						// 	resultCache[bReq.body.artist.name] = bRes;
						// 	bandResults.push(bRes);
						// }else{
						// 	bandFailures.push(bRes)
						// }

						done(bReq)

					}).catch(function(err){
					console.log("getBandPage failure",err);

					let error = {artist:bReq.body.artist.name,error:err};
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


		let finish = function(){
			// console.log("finish!");
			// console.log(Object.keys(resultCache));
			// console.log(JSON.stringify(resultCache,null,4));
			//res.send(resultCache)

		};

		//testing:
		if(executeOnce){
			req.body.artists = [];
			console.error("==========SKIPPING SECOND EXECUTION==============");
		}

		if(req.body.artists.length > 0){

			//testing:
			console.warn("==========SET SKIPONCE==============");
			executeOnce = true;

			let mod = 0;
			let bandLoad = [];

			req.body.artists.forEach(function(ar){

				if(filteredPayload.indexOf(ar) === -1){
					//skip
					console.log("skip",ar.name);
				}
				else{

					fReq = {};
					fReq.body = {token:req.body.token};
					fReq.body.artist = ar;

					search(fReq)
						.then(function(res){

							if(res.genres.length === 0){
								bandLoad.push(ar);

								//we're trying to create payloads for band to process at once

								if(bandLoad.length % runsMagic === 0){
									let offset = bandLoad.length /runsMagic;
									// 1: 0-2
									// 2: 3-5
									// 3: 6-8
									// 4: 9-1
									// console.log(bandLoad.length);
									//console.log("lb",offset-1);
									//console.log("ub",offset+2);
									var load = bandLoad.splice(offset-1,offset + runsMagic -1)
									// console.log("$load",load);
									//console.log("$bandLoad",load);
									band({artists:load})
								}else if(bandLoad.length < runsMagic && !lastRan){
									console.log("lastLoad====",bandLoad.length);
									setTimeout(function(){
										if(bandLoad.length < runsMagic && !lastRan){
											console.log("$bandLoad final",bandLoad);
											lastRan = true;
											band({artists:bandLoad})
										}
									},2000)

									// lastFail[bandLoad.length]++;
									// if(lastFail[bandLoad.length] >= 100){

									// }
									//lastFail++

								}
							}
						}).then(function(){

					})
					//todo: disabled rest of tests

					// .then(function(wRes){
					//
					// 	//just doll them out equally for now
					// 	let check = mod % 2 ===0;
					// 	mod++;
					//
					// 	//todo: add scrape (also, is this pattern sustainable?)
					//
					// 	if(!resultCache[wRes.body.artist.name]){
					// 		if(check){
					// 			camp(wRes).then(function(){
					// 				if(!resultCache[wRes.body.artist.name]){
					// 					console.warn("failed camp, trying band for:" + wRes.body.artist.name);
					// 					band(wRes).then(finish).catch(function(err){
					// 						let msg = "camp -> band failure";
					// 						let error = {msg:msg,artist:wRes.body.artist.name,error:err};
					// 						console.error(error);
					// 					})
					// 				}
					// 				else{finish()}
					// 			})
					// 		}
					// 		else{
					// 			band(wRes).then(function(){
					// 				if(!resultCache[wRes.body.artist.name]){
					// 					console.warn("failed band, trying camp for:" + wRes.body.artist.name);
					// 					camp(wRes).then(finish).catch(function(err){
					// 						let msg = "band -> camp failure";
					// 						let error = {msg:msg,artist:wRes.body.artist.name,error:err};
					// 						console.error(error);
					// 						//fail(error)
					// 					})
					// 				}else{finish()}
					//
					// 			})
					// 		}
					// 	}
					// 	else{
					// 		finish(wRes)
					// 	}
					//
					// })
					// .then(finish)
						.catch(function(err){
							console.error("chain failed for: ",ar.name);
							console.log(err);

						})
				}//not filtered
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
						scrapeFailures.length +
						spotFailures.length;

					let totalResults = wikiResults.length +
						campResults.length +
						bandResults.length +
						scrapeResults.length +
						spotResults.length;

					let notDone = function(limiter,name,print){

						//testing: enable to see readouts of every limiter
						print? console.log(name,limiter.counts()) :{};

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
					//|| notDone(limiterGoogle,"google");
					let checkIt = notDone(limiterSpotify,"spotify") || notDone(limiterWiki,"wiki") || notDone(limiterCamp,"camp") || notDone(limiterBand,"band")

					if(checkIt){

						if(totalTime % 5000 === 0){

							console.log("totalResults/artists",totalResults + "/" + req.body.artists.length);
							console.log("totalFailures",totalFailures);
							let checkIt = notDone(limiterSpotify,"spotify",true)
								|| notDone(limiterWiki,"wiki",true)
								|| notDone(limiterCamp,"camp",true)
								|| notDone(limiterBand,"band",true)


							// console.log("spot",spotResults.length)
							// console.log("w",wikiResults.length);
							// console.log("c",campResults.length);
							// console.log("b",bandResults.length);
							// console.log("s",scrapeResults.length)
						}

						checkCount()
					}else{
						console.log("getExternalInfos finished execution:",Math.abs(new Date() - startDate) / 600);

						console.log("totalResults/artists",totalResults + "/" + req.body.artists.length);
						console.log("totalFailures",totalFailures);

						console.log("spot",spotResults.length)
						console.log("w",wikiResults.length);
						console.log("c",campResults.length);
						console.log("b",bandResults.length);
						console.log("s",scrapeResults.length + " / " + 	scrapeFailures.length);

						//todo:

						// console.log(wikiResultsKeep.length + " wiki results were successful");
						// console.log(googleResults.length + " google results were returned");
						// console.log("FINISHED!",JSON.stringify(wikiResults,null,4));
						// console.log("FINISHED!",JSON.stringify(googleResults,null,4));

						console.log("resultCache",JSON.stringify(resultCache,null,4))

						let results = [];
						for(var nameKey in resultCache){
							results.push(resultCache[nameKey].artist)
						}

						let missingNo = 0;
						//console.log("initial payload",req.body.artists);

						req.body.artists.forEach(function(a){
							if(!resultCache[a.name]){
								missingNo++;
								results.push({name:a.name,artistSongkick_id:a.artistSongkick_id,error:true})
							}
						});

						console.log(missingNo + " padded error results");

						//let ret = wikiResults.concat(campResults).concat(bandResults).concat(scrapeResults);

						console.log("results:",JSON.stringify(results,null,4));

						let nextStrBegin = "function next(err) {";
						var nextStr = next.toString().trim()
						//console.log(nextStr);
						//console.log("=====");
						//console.log(nextStr.slice(0,20));

						if( nextStr.slice(0,20) == nextStrBegin) {
							console.log("standard");
							res.send(results)
						}
						else{
							console.log("custom");

							next(results)
						}

						//if(next){next(results)}else{res.send(results);}

					}
				})
			};

			// setTimeout(function(){
			// 	checkCount();
			// },2000)

			checkCount();
		}
		else{
			console.error({msg:"no artists submitted"});
			res.send();
		}


	}); //promise all checkproms
};

module.exports.getInfos_local =  function(req){
	return new Promise(function(done, fail) {

		var callback = function(res){
			done({data:res})
		};

		module.exports.getInfos(req,{},callback)

	})
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

		//todo: only output from spotify
		//console.log(options.uri);

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
							i = i.trim();
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

module.exports.getBandPage = function(req,res) {

	return new Promise(function(done, fail) {

		// console.log("getBandPage", req.body.artist.name);

		console.log("getBandPage", req);

		let startDate = new Date();
		console.log("start time:",startDate);

		Nightwatch.cli(function(argv) {

			argv.verbose = false;



			//todo: odd - this is the correct path only if you start the app from authorization_code> node app.js
			argv.config = "./nightwatch.conf.js";

			//believe if we start it form Showcase> node authorization_code/app.js it must be:
			// argv.config = "./authorization_code/nightwatch.conf.js"

			// console.warn("COUNT:",runCount);
			// if(runCount === 0){
			// 	console.log("1");
			// 	argv.config = "./authorization_code/nightwatch.conf.js"
			// 	runCount++;
			// }
			// else{
			// 	console.log("2");
			// 	argv.config = "./authorization_code/nightwatch2.conf.js"
			// }

			console.log("argv",argv.config);

			//
			// 	let args = ["headless", "no-sandbox", "disable-gpu"]
			// 	if(runCount === 0){
			// 		args.push("--user-data-dir=C:/ChromeProfile/Profile1")
			// 		runCount++
			// 	}
			// 	else{
			// 		args.push("--user-data-dir=C:/ChromeProfile/Profile2")
			// 	}
			//
			// 	settings.test_settings.chrome2.desiredCapabilities.chromeOptions.args = args;



			//argv.env = env;

			//todo: thought maybe I could point config to an object I generate on the fly
			//argv.config = NWconfig;
			//argv.config.test_workers = false;
			//argv.config.webdriver.server_path = chromedriver.path;

			// let funk = {
			// 	id:99999,
			// 	name:"Funk Worthy",
			// 	identifier:"test-mbei-233r-asfsdf-dfdsasfd",
			//
			// };

			//fuck it I guess

			//todo: testing
			//argv.skipgroup = JSON.stringify(req.body.artist);
			//argv.skipgroup = JSON.stringify([{name:"Funk Worthy"},{name:"Blink-182"},{name:"Slayer"}]);
			argv.skipgroup = JSON.stringify(req.artists);

			var runner = Nightwatch.CliRunner(argv);
			runner
				.setup()
				.startWebDriver()
				.catch(err => {	console.error(err);throw err;})
				.then(() => {return runner.runTests();})
				.catch(err => {
					console.error("band script error1");
					console.error(err);
					runner.processListener.setExitCode(10);})
				.then((str) => {
					console.log("getBandPage finished execution:",Math.abs(new Date() - startDate) / 600);

					//todo:
					done();
					return runner.stopWebDriver();
				})
				// .then(() => {
				// 	process.exit(0);
				// })
				.catch(err => {
					console.error("band script error2");
					console.error(err);
				});

		});
	})//promise
};

//depreciated
module.exports.getBandPage_zombie = function(req,res) {

	return new Promise(function(done, fail) {
		console.log("getBandPage", req.body.artist.name);
		let startDate = new Date();
		console.log("start time:",startDate);

		const browser = new Browser();

		//testing:
		//browser.debug();

		//todo: trying to speed this up
		//bug zombie.js doesn't have shit for documentation
		//debug helps but I can't really tell whats going on

		//best guesses:
		//1) I see 2x 'setTimeout after 15000ms delay + 11s/+15s'
		//2) I wonder if NOT having to load all this other JS (I see a lot of facebook stuff) would speed things up
		//3) Can I load an preserve an 'instance' of the bandsintown main site, then spawn a new copy for each artist?
		//   or even hit the 'back' button when I found what I want and then restart the thing?

		//seems like the durations that i've tried for options (up to 10s) all bomb on batch runes
		// a single run @ 1s helped a little bit 86s -> 58s
		//but 1s when trying to batch process yields :  'No open window with an HTML document'
		let options= {
			duration:"10s"
		};

		browser.visit('https://www.bandsintown.com/en',function(res){
			// browser.visit('https://www.bandsintown.com/en',options,function(res){
			console.log("visited");

			browser
				.fill("input","Funk Worthy")
				// .fill("input",req.body.artist.name)
				.then(function(){

					console.log("inputted");
					let r = 'a[class^="artistResult"]';
					let rs = browser.query(r);
					console.log("$$rs",rs);

					let response = {};
					response.artist = req.body.artist;
					response.artist.genres = [];

					if(!rs){
						let m = {msg:"no result",artist:req.body.artist.name};
						console.warn(m);
						done(response)
					}else {

						browser.click(r).then(function () {
							//browser.html()
							console.log("clicked");

							//todo: BROKEN
							//it just gets to clicked and stops

							//browser.body never seems valid
							// let b = browser.body;
							let page = browser.html();
							let r = 'div[class^="artistBio"]';
							let d = $(page).find(r);
							let str = "";


							d.each(function (k, elem) {
								let t = $(this).text();
								t = t.trim();
								if (t === "Genres:") {
									//console.log("$$",t);
									let next = d[k + 1];
									let tnext = $(next).text();
									//console.log("Genres:",tnext);

									//todo: shitty selector above produces genre list 3x and writes over last
									str = tnext;
								}
							})

							//let ar = browser.query(r);
							//console.log("ar0",ar["children"]["0"]);
							//try inspect on circular json: console.log(util.inspect(ar1s))

							//checkout:
							//https://github.com/assaf/zombie#browser
							//https://stackoverflow.com/questions/5926421/dumping-browser-document-content-using-zombie-js



							//console.log("raw genres:",str);
							if (str.length > 0) {

								let genres = [];
								if (str) {
									if (str.indexOf(",") !== -1) {
										genres = str.split(",")
									} else {
										//console.warn("if this is >1 genre, there was an issue on split:",str);
										genres.push(str);
									}
								}

								//split funny genres
								//examples from https://www.bandsintown.com/en/a/12732676-funk-worthy
								// R&b/soul, R&b, Rock, Soul, Rnb-soul, Fusion, Funk

								let sGenres = [];
								genres.forEach(function (g) {
									g = g.trim().toLowerCase();

									if (g.indexOf("/") !== -1) {
										let sp = g.split("/");
										sp.forEach(function (s) {
											if (sGenres.indexOf(s) === -1) {
												sGenres.push(s)
											}
										})
									} else {
										if (sGenres.indexOf(g) === -1) {
											sGenres.push(g)
										}
									}
								});

								console.log("getBandPage finished execution:",Math.abs(new Date() - startDate) / 600);
								//console.log("split genres",sGenres);

								response.artist.genres = sGenres;
								done(response);

							} else {

								let msg = "bandsintown failed to find genres";
								let error = {msg: msg, artist: req.body.artist.name, error: {}};
								console.error(error);
								fail(error)
							}
						})
					}//else
				})
				.catch(function(err){
					let msg = "band fetch failure";
					let error = {msg:msg,artist:req.body.artist.name,error:err};
					console.error(error);
					fail(error)
				})

		})//visit
	})//promise
};

//todo: for actual searching
var wikiSearch = function(){

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

module.exports.googleQueryBands_DEPRECATED = function(req,res) {
	//console.log("googleQuery",req.body.artist.name);

	return new Promise(function(done, fail) {

		var optionsBands = {
			query: req.body.artist.name + " bandsintown",
			host: 'www.google.com',
			// lang: 'fr',
			// age: 'd1', // last 24 hours ([hdwmy]\d? as in google URL)
			limit: 2,

			//testing: anytime captcha is failing, enable this temporarily
			solver:dbc,
			params: {} // params will be copied as-is in the search URL query string
		};

		let urls = [];
		var scrape =  function(){
			return new Promise(function(done, fail) {
				console.log("scrape",optionsBands);
				//this SHOULD be called once per result, but my 'limit' on scrape isn't working sooo

				try {
					scraper.search(optionsBands, function (err, url, meta) {
						console.log("scraper");
						if (err) {

							console.log("$fucked");
							console.log(err);
							fail(err)
						}

						urls.push(meta.url);
						if (urls.length === 10) {
							console.log(urls[0]);
							done(urls[0])
						}
						// else{console.log(urls.length);}

					})
				}catch(e){
					console.log("$fucked");console.log(e);


				}
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

				let tuple = {};
				tuple.artist = req.body.artist;
				tuple.artist.genres = [];


				//check if url we found is even related to query

				let likeQ = getLikeQuery(req.body.artist.name,urls[0]);
				if(!likeQ){

					console.log("BAND: closest result wasn't like our query:", likeQ.likeQuery + "/" + likeQ.queryRay);
					console.log(req.body.artist.name + " !like " + urls[0]);
					done(tuple)

				}else{
					rp(options)
						.then(function (result) {

							//returns the tuple object declared above, except hopefully with tuple.artist.genres = found genres
							let parseBandHTML = function(html,artist){
								//console.log("parseBandHTML",html);
								let doc = $(html);

								//determine whether or not the result is what we're looking for
								let hs;let str = "";

								//we hit the bio page (preferred)
								let info = doc.find("[class^='artistInfo']")
								//we hit an event page (non-preferred)
								let bio = doc.find("[class^='artistBio']")

								//todo: if on bio page, we will still find infos but only 7 of them

								if(info.length > 7){	hs = info;}
								else if(bio.length > 7){hs = bio;}
								//else, headers will be empty which we catch

								$(hs).each(function(k,elem){
									let t = $(this).text();
									if(t === "Genres: "){
										//console.log($(this).next().text());
										str = $(this).next().text()
									}
								});

								//console.log("genres:",str);
								if(str.length > 0){

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

								}else{
									console.log("bandsintown failed to find genres for",req.body.artist.name);
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
				}
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
			//solver: dbc,
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




//todo: make token system
var token = "BQCKZ5qq9Yau628-1TuNrD7U3deEILFpWaqgLZ-ol9dLaV6JLlVkQsxtV_TvhzxepVFEDVuGBzu14VbLiUUNcvEPOwJPi9SvxQAtr9MDMFsTA_TiUnUAV4uIWIqfDsI0rCQpmeSwB35Wi_EzWNXiRY0s3vbpEDxLT1t-2j5f4ZhMJwEltNYe5pDdLys9lr5OEqWHwyXTbHTDaMN0VqADrxrontSZUqf5kUolQMXVaT8qNvASyBQaqYSjpaJQXGNKpJs5bxOvueavH3OVO6zQTelwzOprlQ"

//todo: testing max thruput

limiterSpotify = new Bottleneck({
	maxConcurrent: 100,
	minTime: 200,
	trackDoneStatus: true
});

var load_artists = function(){
	console.log("load_artists");
	//these are many genre records, so collapse them to unique artists

	var sreq = new sql.Request(poolGlobal);
	sreq.execute("getAllArtistsGenres")
		.then((res)=>{

			var artists = {};
			var artistsOut = [];

			res.recordset.forEach(function(artGen){
				if(!artists[artGen.id]){
					artists[artGen.id] = artGen
					artists[artGen.id].genres = []
					artists[artGen.id].genres.push(artGen.genreName)
				}else{
					artists[artGen.id].genres.push(artGen.genreName)
				}
			})

			for(var ar in artists){
				delete artists[ar].genreName
				if( artists[ar].genres[0] === null){
					artists[ar].genres = [];
				}
				artistsOut.push(artists[ar])
			}

			//todo: makeshift genre filter

			//indie *usually* means rock
			// var genres = ["rock","indie"];

			var genres = ["rock"];
			var artistsOutFiltered = [];
			var genresFiltered = [];


			artistsOut.forEach(function(ar){
				dance:
				for(var x = 0; x < ar.genres.length; x++){
					//check every candidate genre
					for(var y = 0; y < genres.length; y++){
						//if one of them matches, break
						if(ar.genres[x].indexOf(genres[y]) !== -1 ){
							artistsOutFiltered.push(ar);
							genresFiltered.push(ar.genres[x])
							break dance;
						}
					}
				}

			});

			// console.log("artistsOut",JSON.stringify(artistsOut,null,4));
			//console.log("artistsOut",artistsOut.length);
			//console.log("artistsOutFiltered",JSON.stringify(artistsOutFiltered,null,4));
			console.log("artistsOutFiltered",artistsOutFiltered.length);
			console.log("genresFiltered",genresFiltered.length);

			var promises = [];

			//artistsOut
			artistsOutFiltered.forEach(function(ar){
				var req = {"body":{"artist":ar,"token":token,"max":3,"playlist":{id:"60J4a7oWhXemOD5hzYUeYh"}}}
				//promises.push(module.exports.playlist_add_artist_tracks_local(req))

				limiterSpotify.schedule(module.exports.playlist_add_artist_tracks_local,req,{})
					.then(function(){

				}).catch((err)=>{
					console.log(err);
				})
			});

			Promise.all(promises).then(function(results){
				console.log("results",results);

			});


		})
		.catch((err)=>{
			console.log(err);
		})

};

setTimeout(function(){
	load_artists();
},1000);

//todo: static playlist id
//spotify:playlist:60J4a7oWhXemOD5hzYUeYh
module.exports.playlist_add_artist_tracks =  function(req,res){
	return new Promise(function(done, fail) {

		// console.log(req.body.token);
		// console.log(req.body.playlist);
		// console.log(req.body.artist);
		// console.log(req.body.max);

		let local = {body:{}};
		Object.assign(local.body,req.body);
		local.body.local = true;

		module.exports.artist_topTracks(local)
			.then(function(result1){
				//console.log("result1",result1);

				let local2 = {body:{}};
				Object.assign(local2.body,req.body);
				// local2.body.playlist = req.body.playlist;

				local2.body.tracks = result1.tracks;
				local2.body.local = true;

				module.exports.playlist_add_tracks(local2).then(function(result2){

					//console.log("result2",result2);

				})
			}).catch((err)=>{
			console.log(err);
		})
	})
};



module.exports.playlist_add_artist_tracks_local=  function(req){
	return new Promise(function(done, fail) {

		var callback = function(res){
			done({data:res})
		};

		module.exports.playlist_add_artist_tracks(req,{},callback)

	})
};

//sometimes this seems to just run 1x, 2x more randomly?

module.exports.playlist_add_tracks =  function(req,res){
	return new Promise(function(done, fail) {

		//console.log(req.body.playlist);
		//console.log(req.body.tracks);

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

		//console.log(options.uri);

		rp(options).then(function(result){
			//console.log("res",result);

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

		//console.log(req.body.artist);
		//console.log(req.body.local);

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
			//console.log("result",result.tracks);

			//console.log("MAX",req.body.max);
			if(req.body.max){
				//console.log("trimming to", req.body.max);
				result.tracks = result.tracks.slice(0,req.body.max)
			}
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