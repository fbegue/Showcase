var rp = require('request-promise');
let sql = require("mssql");
var _ = require('lodash')

var app = require('./app');
// var jstr =  require('./app').jstr;
const sApi = require('./spotify_api');
const resolver_api = require('./resolver_api');
const db_api = require('./db_api')

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


//=================================================

var Bottleneck = require("bottleneck");

let limiterSpotify,limiterSpotifyTrack,limiterSpotifySearch,limiterBand,limiterWiki,limiterCamp,limiterGoogle;
let limiters = function(){

	//todo: optimize
	limiterSpotify = new Bottleneck({
		maxConcurrent: 10,
		minTime: 100,
		trackDoneStatus: true
	});

	limiterSpotifyTrack = new Bottleneck({
		maxConcurrent: 10,
		minTime: 100,
		trackDoneStatus: true
	});

	//this is what it looked like on throttle
	// var promiseThrottle = new PromiseThrottle({
	// 	//35 mostly works, but occasional failure for a 1 second reduction seems silly
	// 	requestsPerSecond: 15,           // up to 1 request per second
	// 	promiseImplementation: Promise  // the Promise library you are using
	// });

	//10 per second
	//todo: changed when I started getting unexpected ETIMEDOUTs?
	// limiterSpotifySearch = new Bottleneck({
	// 	maxConcurrent: 10,
	// 	minTime: 100,
	// 	trackDoneStatus: true
	// });

	limiterSpotifySearch = new Bottleneck({
		maxConcurrent: 9,
		minTime: 200,
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
limiters();

//todo: made this non-configuraable b/c I'm so confused as to why this changed?
//maybe I'm just being dumb but...
module.exports.getPage = function(body,key,req){
	return new Promise(function(done, fail) {

		var re = /.*\?/;
		//todo: with key
		var reAfter = /.*\?type=artist&after=(.*)&limit=50/;
		var reRes =  re.exec(body.next);
		var baseUrl = reRes[0]; //not an array
		var reAfterRes =  reAfter.exec(body.next);
		var after = reAfterRes[1];//not an array
		var q1 = 'offset=';var q2 = '&limit=50';

		//todo: with key
		//baseUrl = baseUrl + "type=" + key + "&"}
		baseUrl = baseUrl + "type=artist&after=" + after + "&limit=50"
		//console.log("baseUrl",baseUrl);
		let options = {uri:baseUrl,headers: {"Authorization":'Bearer ' + req.body.spotifyApi.getAccessToken()}, json: true};

		function get(options) {
			console.log(options.uri);
			return rp(options);
		}
		get(options)
			.then(r =>{
				done(r);
			},e =>{
				fail(e);
			})

	})
}

module.exports.getPages = function(body,key){
    return new Promise(function(done, fail) {
		var re = /.*\?/;var reRes =  re.exec(body.next);
		var baseUrl = reRes[0]; //not an array

		var q1 = 'offset=';var q2 = '&limit=50';

		//todo: may have to adjust how I do parse this
		if(key){baseUrl = baseUrl + "type=" + key + "&"}
		console.log("baseUrl",baseUrl);

		let options = {uri:baseUrl,headers: {"Authorization":'Bearer ' + sApi.token}, json: true};
		var num = Math.ceil(body.total / 50)
		console.log("total",body.total);
		console.log("scheduled",num);
		var promises = [];

		options.uri = baseUrl + q1 + 0 + q2

		for(var x=1; x<= num;x++){
			function get(x,options){
				options.uri = baseUrl + q1 + 50*x + q2
				console.log(options.uri);
				return rp(options);
			}
			//note: something about rp doesn't work the way I thought it would
			//promises.push(limiterSpotify.schedule(get(options)));
			promises.push(limiterSpotify.schedule(get,x,options));
		}
		Promise.all(promises).then(r => {
			//console.log('here');
			done(r);
			},err =>{
			console.error(err.error)
			// fail(err)
		})
    })
}




/**
 * resolvePlayob
 * We're doing reporting on this playob - so we need to record the
 * result produced when we process the payload
 *
 * */
module.exports.resolvePlayob = function(playob){
	return new Promise(function(done, fail) {
		module.exports.resolveArtists(playob.payload)
			.then(resolvedArtists =>{
				//specifically, leave it undefined
				//resolvedArtists:[];
				console.log(resolvedArtists === null);
				!(resolvedArtists)?playob.payloadResolved = resolvedArtists:playob.payloadResolved =null;
				done(playob);
				},e => {fail(e);})
	})}

/**
 *  resolveArtists
 * @desc resolve the artists via Spotify, and submit them to the db - fully qualifying the genres in the process
 * @param artists
 */
module.exports.resolveArtists = function(req,artists){
	return new Promise(function(done, fail) {
			console.log("resolveArtists",artists.length);
			let startDate = new Date(); console.log("resolveSpotify start time:",startDate);
			//resolver.spotify expects batches of 50 artist's ids
			var promises = [];
			var payloads = [];
			var payload = [];
			artists.forEach(function(a,i){

				//testing:
				// a.id === '7HhTERkBV4Ot14KphgBfSh' ? console.log(a):{};
				// a.id === '3NTbCfTrDL2WFob27hdLTe' ? console.log(a):{};
				if(i === 0){payload.push(a.id)}
				else{
					if(!(i % 50 === 0)){	payload.push(a.id)}
					else{payloads.push(payload);payload = [];payload.push(a.id)}
				}
			});
			payload.length ? payloads.push(payload):{};
			payloads.forEach(function(pay){
				promises.push(limiterSpotify.schedule(resolver_api.spotifyArtists,pay,req,{}))
			});

			Promise.all(promises).then(results => {
				console.log("resolveArtists finished execution:",Math.abs(new Date() - startDate) / 600);
				//console.log("$results",app.jstr(results));

				//there will be as many results as there were payloads required to resolve the
				//batch of artists we were tossed

				//testing:
				results.length === 0?console.warn("zero length result"):{};

				//unwind them all
				var resolved = [];
				results.forEach(function(r){
					// r.artists.forEach(function(a){
					// 	// a.id === '7HhTERkBV4Ot14KphgBfSh' ? console.log(a):{};
					// });
					//testing: necessary check?
					if(!(r.artists.length > 0)){
						console.warn("resolve artists failed to return any",r)
					}else{
						db_api.commitArtistGenres(r.artists)
							.then(resolved =>{
								//testing:
								done(r.artists)
							})
					}
				});
				// console.log(resolved.length === 0);
				// resolved.length === 0 ? resolved = null:{};
				// done(resolved)
			},e => {fail(e);})
	})
}


//todo: should really receive one at a time
//receives a batch of playlists and returns all tracks
//returns an array of objects, one for each input playlist {tracks:[track],playist:{}}
module.exports.resolvePlaylists = function(body){
	return new Promise(function(done, fail) {

		console.log("# of playlists to process:",body.playlists.length);
		let startDate = new Date();
		console.log("start time:",startDate);

		console.log();

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
				"Authorization":'Bearer ' + body.spotifyApi.getAccessToken()
			},
			json: true
		};

		// var promiseThrottle_playlists = new PromiseThrottle({
		// 	requestsPerSecond: 5,
		// 	//362
		// 	// requestsPerSecond: 20,
		// 	//124
		// 	promiseImplementation: Promise  // the Promise library you are using
		// });

		let promises = [];

		body.playlists.forEach(function(play){
			options = {
				uri: "",
				headers: {
					// 'User-Agent': 'Request-Promise',
					"Authorization":'Bearer ' + body.spotifyApi.getAccessToken()
				},
				json: true,
			};

			options.url =  url1 + play.id + url2;
			options.offset = 0;
			options.limit = 50;
			options.uri = options.url + "?fields=items.track(id,name,artists)&limit=" + options.limit + "&offset=" + options.offset;
			options.playlist = play;
			options.store = [];
			promises.push(limiterSpotifyTrack.schedule(getPages,options,{}))
			//promises.push(promiseThrottle_playlists.add(getPages.bind(this,options)));

		})
		Promise.all(promises).then(function(results){
			console.log("playlist_tracks finished execution:",Math.abs(new Date() - startDate) / 600);
			//console.log("results ",results.length);
			//console.log("results ",results);

			let payloads = [];
			let payload = {};
			results.forEach(function(op){
				payload = {};
				payload.tracks = op.store;
				payload.playlist = op.playlist;
				payloads.push(payload)
			});
			done(payloads);
		}).catch(e =>{
			//console.log(e);
			console.log("issue resolving playlist_tracks");
			fail(e);
		})
	})//promise

};
