//repo
//https://github.com/schnogz/songkick-api-node
//All requests to the library will be returned a promise and when resolved the response will be JSON.

const apikey = "pdBY8kzaJtEjFrcw"

const Songkick = require('songkick-api-node');
const fs = require('fs')

//https://github.com/Glench/fuzzyset.js
//http://glench.github.io/fuzzyset.js/ui/
const Fuzzyset = require('fuzzyset.js').FuzzySet;


const songkickApi = new Songkick(apikey);


const aggregator = require('./aggregator');
const db_api = require('./db_api');
const app = require('./app');
const puppet = require('./puppet').puppet;

var db_mongo_api = require('./db_mongo_api')
var spotify_api = require('./spotify_api')



let sql = require('mssql');

let connect = function(){
	console.log("connect...");
	try {
		conn.connect()
			.then((res) => {
				console.log("...success!");

				let sreq = new sql.Request(conn)
				sreq.query('select * from xtest').then((res) => {
					console.log(res);
				})
			})
			.catch(function(err){
				console.log(err);
			});

	} catch (err) {
		console.log(err);
	}
};

//todo: if trying to use localhost SQL server
//connect();




//just checking out raw artist search
var searchArtists = function(){
	console.log("searchArtists");
	songkickApi.searchArtists({ query: 'Queen' })
		.then((res)=>{
			console.log(JSON.stringify(res[0],null,4));

			if(res[0].identifier){
				res[0].identifier.forEach(function(id){
					console.log(id.mbid);
				})
			}
		})
}
//searchArtists();


//figure out metro ids (i think these are universal location ids for places)

//not sure yet about returns for these - are they always city & metro object pairs:

//[
//    { //one pair which describes the query's possible metro and city result
//        {
//            city:{"..."}
//        },
//        {
//            city:{"..."}
//        }
//    }
//]

//oakland = bay area
//cleveland = Cleveland & Cleveland Heights

var findWithAttr = function(array, attr, value) {
	for(var i = 0; i < array.length; i += 1) {
		if(array[i][attr] === value) {
			return i;
		}
	}
	return -1;
};

var count_properties = function(object){
	var count = 0;
	for (var prop in object) {
		if (object.hasOwnProperty(prop)) {count++}
	}
	return count;
};

var weekday = new Array(7);
weekday[0] =  "Sun";
weekday[1] = "Mon";
weekday[2] = "Tues";
weekday[3] = "Wed";
weekday[4] = "Thurs";
weekday[5] = "Fri";
weekday[6] = "Sat";

var weekday_full = new Array(7);
weekday_full[0] =  "Sunday";
weekday_full[1] = "Monday";
weekday_full[2] = "Tuesday";
weekday_full[3] = "Wednesday";
weekday_full[4] = "Thursday";
weekday_full[5] = "Friday";
weekday_full[6] = "Saturday";

/**
 * find metros from string query
 * @function find_metros
 **/
var find_metros = function() {
	var state_string = "OH"
	songkickApi.searchLocations({query: 'Dayton'})
		.then(function (results) {
			console.log("returned: ", results.length);


			var json_parsed = [];

			results.forEach(function (record) {

				if (record.city) {
					if (record.city.state.displayName == state_string) {
						json_parsed.push(record)
					}
				}
				else if (record.metroarea) {
					if (record.metroarea.state.displayName == state_string) {
						json_parsed.push(record)
					}
				}
			})

			console.log("len: ", json_parsed.length);

			var json = JSON.stringify(json_parsed, null, 4)

			fs.writeFile("output.json", json, function (err) {
				if (err) {
					return console.log(err);
				}

				console.log("The file was saved!");
			});

		})

}

//find_metros()

var metros = [
	{"displayName":"Columbus",
		"id":9480},
	{"displayName": "Salt Lake City",
		"id":13560},
	{"displayName":"SF Bay Area",
		"id":26330},
	{"displayName":"Cleveland",
		"id":14700},
	{"displayName":"Cincinnati",
		"id":22040},
	{"displayName":"Dayton",
		"id":3673}
];

var dateFilter = {};
dateFilter.start = '2018-07-12';
dateFilter.end = '2018-07-18';

/**
 * then get events upcoming for a metro
 * @function get_metro_events
 **/

var fetch_metro_events = function(metro,dateFilter){

	return new Promise(function(done, fail) {

		dateFilter.start = new Date(dateFilter.start);
		dateFilter.end = new Date(dateFilter.end);
		//console.log(dateFilter.start);
		//console.log(dateFilter.end);

		//used for stats in return object
		var event_count = 0;

		var get_events = function(metro){
			return new Promise(function(done1, fail) {
				console.log("get_events");

				var all_results = [];
				var page_count = 0;

				/**
				 * recusively called until page_length invariant stops chain, hence its broken out here
				 * @function get
				 **/
				var get = function(){

					var params = {};
					params.page = page_count;
					params.per_page = 50;

					console.log("getting" + metro.displayName + " " + metro.id + " page {" + page_count + "}...");
					songkickApi.getLocationUpcomingEvents(metro.id,params)
						.then(function(events){

							//console.log(JSON.stringify(events, null,4));

							var filterInRange = function(event){

								var res = true;
								var eDate = new Date(event.start.date)
								// console.log( dateFilter.start + " > "  + eDate +  " < "+ dateFilter.end);
								// console.log( eDate < dateFilter.start)
								// console.log( eDate > dateFilter.end);

								//if start invalid, set false and ignore end value
								//if end invalid, set false and ignore start value unless start is false, then take start

								if(dateFilter.start && dateFilter.end){
									if(eDate < dateFilter.start){	res = false;}
									if(eDate > dateFilter.end || !res){res = false;}

								}else if(dateFilter.start && !dateFilter.end) {
									if(eDate < dateFilter.start){res = false;}

								}else if(!dateFilter.start && dateFilter.end) {
									if(eDate > dateFilter.end){res = false;}
								}
								// console.log(":: " + res);
								// console.log(event.start.date);
								return res;
							};


							var inRange = [];
							var outRange = [];

							for(var x = 0; x < events.length; x++) {

								if (filterInRange(events[x])) {inRange.push(events[x])}
								else {outRange.push(events[x])}
							}

							var result = {}
							result.id = metro.id;
							result.displayName = metro.displayName;
							result.events = inRange;

							//only push non-zero events.length results
							if(result.events.length > 0){
								all_results.push(result)
							}


							//all_results is in array of per-page result.events
							all_results.forEach(function(result){
								event_count = event_count + result.events.length;
							});

							//console.log("--------------------------------");
							//console.log("outrange:",outRange.length);
							//console.log("new events:",result.events.length);
							//console.log("total events:",event_count);
							//console.log("paging invariant:",events.length);

							//if page length is < 50
							//OR if we're starting to get zero-inrange results back, but we have SOME (for dateFilter.start)

							if(events.length < 50 || (result.events.length === 0 && all_results.length !== 0)){

								console.log("invariant tripped. stopping.");
								done1(all_results)
							}
							else{
								page_count++;
								get()
							}
						})
				};

				get()

			})
		}


		//todo: option to do multiple metros

		var promises = [];

		//metros.forEach(function(metro){
		//    promises.push(get_events(metro))
		//})

		promises.push(get_events(metro));

		//results is an object with three fields: metro id, displayName (of metro) and the future events in that metro
		Promise.all(promises).then(function(results){

			//console.log(JSON.stringify(results,null,4));

			//todo: b/c I'm doing one metro?
			results = results[0];

			let events = [];
			let metro_id = results[0].id;
			let ids = {};

			results.forEach(function(result){
				result.events.forEach(function(event){

					//console.log(JSON.parse(JSON.stringify(event)));
					if(ids[event.id]){

					}else{
						ids[event.id] = event.id;
						event.metro_id = metro_id;
						//if(event.id === 35513049){	console.log(event)}
						events.push(event);
					}

				})
			});


			/**
			 * populate performance_dates array for writing later to songkick_performances
			 * @function write_schedule
			 **/
			var write_schedule = function(){
				results.forEach(function(result){

					//console.log("===============");
					//console.log(result);


					// if(result.displayName == "Columbus"){

					result.events.forEach(function(event){


						//todo: handle festivals differently (event.type = 'Festival')
						//performance is an array of artists (headliner, support, etc)
						var performance = {};

						var date = new Date(event.start.date)
						var m = date.getUTCMonth() + 1
						//var d = date.getDate()
						var d = date.getUTCDate()
						var y  = date.getFullYear()
						var day = date.getUTCDay()

						var newDate = weekday[day] + ", " + m + "-" + d + "-" + y
						//console.log(m + " " + d + " " + y );

						// console.log("######");
						// console.log(event.start.date);
						// console.log(date);
						// console.log(newDate);

						//perf.date = event.start.date;
						//performance.date = newDate;

						performance.venue = event.venue.displayName;
						performance.artists = [];
						performance.id = event.id;


						event.performance.forEach(function(perf){
							performance.artists.push(perf.artist.displayName)

						});

						//haven't created entry for date yet
						if(dates.indexOf(newDate) == -1){
							dates.push(newDate);


							performance_dates[newDate] = [];
							performance_dates[newDate].push(performance);
						}
						else{
							performance_dates[newDate].push(performance);

							//todo: tried to eliminate duplicate performance_dates
							// if(performance_dates[newDate].indexOf(performance) == -1){
							// 	performance_dates[newDate].push(performance);
							// }
							// else{
							// 	console.log(performance);
							// }
						}

					})

					// }//displayName
				})
			}; //write schedule

			//write_schedule();

			console.log("----------------------");
			console.log("# of payloads: ",results.length);
			console.log("events length: ",events.length);
			console.log("----------------------");

			done(events);

			// var json = JSON.stringify(results,null,4)
			//
			//
			// fs.writeFile(raw, json, function(err) {
			//
			// 	if(err) {   return console.log(err); }
			// 	else{ console.log(raw + " saved!");}
			// });
			//
			// var output = {};
			// output.result = {};
			// output.result.area = metro.displayName;
			// output.result.events = event_count;
			// output.result.dates = performance_dates;
			//
			// json = JSON.stringify(output,null,4);
			//
			// fs.writeFile(areaDatesArtists, json, function(err) {
			//
			// 	if(err) {   return console.log(err); }
			// 	else{
			// 		console.log(areaDatesArtists + " saved!");
			// 		done2(results);
			// 	}
			//
			// });


		}).catch(function(e){
			console.log(e);
		})

	})

}//getMetroEvents

var fake_events = require('./example data objects/event.js')
var fake_metro_events =  function(label){
	return new Promise(function(done, fail) {
		console.warn("faking events:",label);
		console.warn(fake_events[label].length);
		done(fake_events[label])
	})
}

/**
 * then get events upcoming for a metro
 * @function getMetroEvents
 * @param req.body{
 *	"metro":{"displayName":"Columbus",
 *		"id":9480},
 *	"dateFilter":{"start":"2020-02-29T16:36:07.100Z","end":"2020-03-06T16:36:07.100Z"}
 *}
 **/
module.exports.fetchMetroEvents =  function(req, res,next){
	return new Promise(function(done, fail) {

		let startDate = new Date();console.log("fetchMetroEvents start time:",startDate);

		if (new Date(req.body.dateFilter.start).getDate() < new Date().getDate()) {
			done({error: "start date is less than current date"})}

		else {
			//testing:
			//fake_metro_events('meltedPlus')
			fetch_metro_events(req.body.metro, req.body.dateFilter)
				.then(function (results) {
					if (next) {
						next(results)
					} else {
						//console.log(app.jstr(results));

						//this object acts as a record tracking the result of this run of
						//fetch_metro_events. we will record this in our logs so that we can tell:

						//todo: is aas_match being filled with either spotify or songkick genre data an issue?

						/**
						 * @class metrOb
						 * @prop artists - total # of artists from this run
						 * @prop aas_match - we already linked songkick-spotify to
						 * @prop aas_match_genres - "" and found genres from either spotify OR songkick
						 *
						 * @prop leven_match - # new aas_matches we formed from w/ Leven
						 * @prop spotify_match - # new aas_matches we formed from w/ Spotify free text artist search
						 */

						var metrOb = {metro:req.body.metro,dateFilter:req.body.dateFilter,
							artists:[], aas_match:[],aas_match_genres:[], leven_match:[], spotify_match:[],
							payload:[],
						};

						//is there such thing as lastLook for songkick artists?
						//yes - the lastLook for songkick artists records the last time
						//we hit the db with a levenMatch, spotify free search or puppet/other resolver utilities request?

						//but this lastLook is more than just 'the last time I looked for genres' - here we are also talking
						//about linking songkick artist to spotify - how often do the inputs to those two things change?
						//anytime my NO THE spotify library grows I now have new artists to try to free match on
						//but thats really it as far as newly created linking information goes right? free text is my
						//only method of linking songkick and spotify artists right now.
						//so we just record 'lastLookSpotify' for songkickArtists

						//wheras 'lastLook' for all songkick artists is a json object describing the last time we looked
						//for GENRES in each resolver utility - exactly the same as a spotify artist 'lastLook'


						//so the plan here will be:

						// 1)   check if we know of a match between songkick and spotify
						//      AND pull down existing genre info for:
						//      1.b) just songkick
						//      1.b) the spotify match

						// 2) attempt to leven match on all spotify artists
						// 2.a) pull down genres w/ lastLook on new matches

						// 3 Spotify free text artist search?
						// 4) puppet


						//todo: how to parallel these? mixing promises here (1)
						var AASMatch = [];
						AASMatch.push(db_mongo_api.insert(results));

						//testing:
						//results = results.splice(0,1)
						//console.warn("clipping AASMatch results to 1!!!");
						//console.log(AASMatch[0]);


						results.forEach(ob =>{
							ob.performance.forEach(p =>{
								var a = {id:p.artist.id,name:p.artist.displayName};
								metrOb.artists.push(a);
								AASMatch.push(db_api.checkDBFor_artist_artistSongkick_match(a))
							})
						});

						console.log("artists",metrOb.artists.length);

						//testing:
						//var death = metrOb.artists.filter(a =>{return a.name === 'Death Valley Girls'});
						metrOb.artists = metrOb.artists.slice(0,5);
						//metrOb.artists.push(death[0]);
						console.warn("clipping total artists to 5!!!");
						//console.log(app.jstr(metrOb.artists));


						//check if we ALREADY KNOW OF a match between songkick and spotify
						Promise.all(AASMatch).then(results => {

								var LevenMatch = [];

								//todo: how to parallel these? mixing promises here (2)
								results.shift();

								//make a map of the matches we got so we can filter a payload for step (2)
								results.forEach(r =>{

									//record differently depending on weather we found genres

									if(r.genres.length > 0){
										//matched and found genres. just recording for posterity
										//and filtering out of next step
										metrOb.aas_match_genres.push(r)
									}
									else if(r.length === 0){
										//matched but no genres
										metrOb.aas_match.push(r);
										LevenMatch.push(db_api.checkDBForArtistLevenMatch(r))
									}
									else{
										//no match
										LevenMatch.push(db_api.checkDBForArtistLevenMatch(r))
									}
								});


								console.log("metrOb.aas_match",metrOb.aas_match.length);
								console.log("metrOb.aas_match_genres",metrOb.aas_match_genres.length);
								console.log("LevenMatch payload",LevenMatch.length);

								//testing:
								//LevenMatch.push(db_api.checkDBForArtistLevenMatch({name:"earth gang",id:1234324}));

								Promise.all(LevenMatch).then(results => {

									//spotify artist string search

									//todo: MOVE
									var Bottleneck = require("bottleneck");
									var limiterSpotify = new Bottleneck({
										maxConcurrent: 15,
										minTime: 100,
										trackDoneStatus: true
									});

									//history:
									//238 @ 20:100 FAIL
									//238 @ 15:100 PASS
									var searches = [];
									var artistSongkicks = [];

									//testing:
									console.warn("auto-failing LevenMatch results");

									results.forEach(r =>{

										//testing:
										r.error = true;

										if(r.error === undefined){

											//record LevenMatch we found
											//todo: evaluate these new matches integrity

											metrOb.leven_match.push(r);

											//commit to match to db
											artistSongkicks.push(db_api.commit_artistSongkick_with_match(r))


											//we couldn't find a match in our db via direct id lookups
											//or my levenmatching, but lets try one more time to link
											//spotify and songkick artists before we just work with the songkick
											//artist and try to resolve genres for it
										}else{

											//right?
											delete r.error;
											searches.push(limiterSpotify.schedule(spotify_api.searchArtist,r,{}))
										}
									});


									console.log("leven_match",metrOb.leven_match.length);
									console.log("queries #",searches.length);
									console.log("metrobArtists #",artistSongkicks.length);



									//todo: parallel
									var combined_promises = artistSongkicks.concat(searches);

									Promise.all(combined_promises).then(results => {
										//look like: {artist:{},result:{}}
										//console.log("$searches",app.jstr(results[0]));
										var newMatches = [];
										var newMatches_genres = [];
										var rejectedMatches = [];
										var noMatches = [];

										var aas_promises = [];

										results.forEach(r =>{

											//todo: dbl check necessary?
											if(r.result.body.artists.items === null || r.result.body.artists.items.length === 0  ){
												noMatches.push(r.artist)}
											else{
												var item = r.result.body.artists.items[0];	var artist = r.artist;
												// console.log(item.name + "/" + artist.name);
												var a = FuzzySet();a.add(item.name);
												//console.log("m",a.get(artist.name));

												//bad match
												//push onto next payload
												if(a.get(item.name) === null || a.get(item.name)[0][0] < .5){
													rejectedMatches.push([item.name,artist.name])
													console.log(artist);
													console.log(item.genres);
													console.log(a.get(item.name) );
												}else{
													//quality match, no genres means we push onto next payload
													//and we also record this new match
													if(item.genres.length === 0){
														newMatches.push([item.name,artist.name])
														//todo: next payload

													}
													//new quality match with genres, so skip next payload
													//but we still need to record this
													else{
														newMatches_genres.push([item.name,artist.name])
													}

													//example songkickOb
													// var songkickOb = {
													// 	id: '1xD85sp0kecIVuMwUHShxs',
													// 	name: 'Twin Peaks',
													// 	artistSongkick_id: 296530,
													// 	displayName: 'Twin Peaks',
													// 	genres: []}

													// console.log(item);
													// console.log(artist);

													var songkickOb = {id:item.id,name:item.name,artistSongkick_id:artist.id,displayName:artist.name,genres:item.genres}
													songkickOb.newSpotifyArtist = item;
													aas_promises.push(db_api.commit_artistSongkick_with_match(songkickOb))

												}
											}
										})//results.each

										//testing:
										// console.log(noMatches);
										// console.log(rejectedMatches);
										// console.log(newMatches);

										Promise.all(aas_promises).then(r => {
												//console.log("4====================");
												//console.log(r);
												console.log("fetchMetroEvents finished execution:",Math.abs(new Date() - startDate) / 600);
												console.log("all events, artists and genres committed!");
											},
											error =>{ console.log("$aas_promises error",error);})


									},error =>{ console.log("$searches error",error);})

									//puppets

									var puppets = [];
									// //console.log("$levenMatch",app.jstr(results));
									// results.forEach(r =>{
									// 	if(!(r.error)){
									// 		//should be artist objects w/ genres
									// 		metrOb.db.push(r);
									// 	}else{
									// 		puppets.push(puppet(r))
									// 	}
									// })

									//console.log("metrOb",app.jstr(metrOb));



									// Promise.all(puppets).then(results2 => {
									// 	console.log("$results2",app.jstr(results2));
									// },error =>{ console.log("$puppets",error);})

								},error =>{ console.log("$LevenMatch",error);})
							},
							error =>{ console.log("$AASMatch",error);})

						//expecting a playob so we'll wrap this here
						// db_api.checkDBForArtistGenres({artists:artists}).then(r =>{
						// 	console.log("checkDBForArtistGenres:",r);
						// })
						//aggregator.bandsintown

						//testing:
						//res.send(results);
					}
				})
		}
	})
};

module.exports.get_metro_events_local=  function(req){
	return new Promise(function(done, fail) {

		var callback = function(res){
			done({data:res})
		};

		module.exports.get_metro_events(req,{},callback)

	})
};

module.exports.resolveEvents=  function(req){
	return new Promise(function(done, fail) {
		//todo: ajax weirdness
		req.body = JSON.parse(req.body.data);
		db_mongo_api.fetch(req.body.metro.id.toString()).then(events =>{
			//console.log(app.jstr(events));
			console.log("#events:",events.length);
			var promises = [];
			var perfMap = {}
			events.forEach(e =>{
				e.performance.forEach(p =>{
					perfMap[p.id] = p;
					//trying a little trick to send ancillary data with request
					async function commit(artist,perf) {
						var match  = await db_api.checkDBFor_artist_artistSongkick_match(artist);
						return {match:match,perf:perf}
					}
					promises.push(commit(p.artist,p));
				});
			});
			Promise.all(promises).then(results =>{
				//console.log(app.jstr(r));

				//todo: speed up unwinding

				//setting perfMap earlier + sending perf along helps unwind results
				results.forEach(r =>{
					perfMap[r.perf.id].artist = r.match;
				});

				//but binding them back is still n^n (although, mostly not too many performances)
				events.forEach(e =>{
					e.performance.forEach(p =>{
						p = perfMap[p.id]
					})
				});

				console.log();
				done(events);
			},e =>{

			})

		})
	})
};

//module.exports.fuzzy_compare = fuzzy_compare;



// var raw = "raw_" + metro_select.displayName +"_" + dateFilter.start + "-" + dateFilter.end + ".json"
// var areaDatesArtists = "areaDatesArtists_" + metro_select.displayName +"_" + dateFilter.start + "-" + dateFilter.end + ".json"

//todo: executing these sequentially giving me some issue

// get_metro_events(metro_select,dateFilter,raw,areaDatesArtists)
// 	.then(function(){
// 		console.log("finished get_metro_events");
// 	});

//var artist_input = "my_artists.json";
// // var artist_input = "aubrey_123073652_artists.json";
//var artist_input = "aubrey_123073652_dacandyman01_artists.json";
// var artist_input = "aubrey_123073652_dacandyman01_artists_genre.json";
//
//
// var my_artists = require("./../authorization_code/public/" + artist_input).artists;
//
// var my_performances = require("./" + areaDatesArtists).result;
//
// var matches = "matches_" + metro_select.displayName +"_" + dateFilter.start + "-" + dateFilter.end + ".json"
//
// console.log("artist input: ",artist_input);
// console.log("events input: ",areaDatesArtists);
//
// fuzzy_compare(my_performances,my_artists,matches)
// 	.then(function(){
// 		console.log("finished fuzzy_compare");
// 	});




// get_metro_events(metro_select,dateFilter,raw,areaDatesArtists)
// 	.then(fuzzy_compare(my_performances,my_artists))
// 	.then(function(){
// 		console.log("FINISHED!");
//
// });

// fuzzy_compare(my_performances,my_artists,matches)
// 	.then(function(){
// 		console.log("finished fuzzy_compare");
// 	});

// const promiseSerial = funcs =>
// 	funcs.reduce((promise, func) =>
// 			promise.then(result => func().then(Array.prototype.concat.bind(result))),
// 		Promise.resolve([]))
//

// var funcs = [];
// funcs.push(get_metro_events(metro_select,dateFilter,raw,areaDatesArtists))
// funcs.push(fuzzy_compare(my_performances,my_artists))
//
// // execute Promises in serial
// promiseSerial(funcs)
// 	.then(function(){
// 		console.log("FINISHED!")
// 	})
// 	.catch(function(err){
// 		console.log("ERROR",err)
// 	})
//




// var tasks = [];
// tasks.push(get_metro_events(metro_select,dateFilter,raw,areaDatesArtists))
// tasks.push(fuzzy_compare(my_performances,my_artists))
// // const tasks = getTaskArray();
// return tasks.reduce((promiseChain, currentTask) => {
// 	return promiseChain.then(chainResults =>
// 		currentTask.then(currentResult =>
// 			[ ...chainResults, currentResult ]
// 		)
// 	);
// }, Promise.resolve([])).then(arrayOfResults => {
// 	// Do something with all results
// });


