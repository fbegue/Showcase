//repo
//https://github.com/schnogz/songkick-api-node
//All requests to the library will be returned a promise and when resolved the response will be JSON.

const apikey = "pdBY8kzaJtEjFrcw"

const Songkick = require('songkick-api-node');
const fs = require('fs')
var FuzzyMatching = require('fuzzy-matching');

const songkickApi = new Songkick(apikey);


const aggregator = require('./aggregator');
const db_api = require('./db_api');
const app = require('./app');
const puppet = require('./puppet').puppet;

var db_mongo_api = require('./db_mongo_api')
var spotify_api = require('./spotify_api')

module.exports.test = function(req, res){
	console.log("test!");
	let data = "test";
	res.send({
		data
	});
};


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

let sql = require('mssql');

const msnodesqlv8 =  require("msnodesqlv8");
// const conn = new sql.ConnectionPool({
// 	database: "master",
// 	//server: "localhost\\SQLEXPRESS",
// 	server: "localhost\\SQLEXPRESS",
// 	user:"test",
// 	password:"test",
// 	driver: "msnodesqlv8"
// 	// options: {
// 	// 	trustedConnection: true
// 	// }
// });

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


/**
 * fuzzy compare two json files
 * @function fuzzy_compare
 **/
var fuzzy_compare = function(performances,artist_input,matchesName){

	return new Promise(function(done, fail) {

		// console.log("fuzzy compare performances input:",performances);
		// console.log("fuzzy compare artist input: ", artist_input);

		// var my_artists = require("./../authorization_code/public/my_artists.json").artists;
		// var my_performances = require("./songkick_performances.json").result;

		var my_artists = artist_input;
		var my_performances = performances;

		console.log(my_artists.length + " spotify artists.");
		console.log(count_properties(my_performances.dates) + " unique dates.");
		console.log(my_performances.events + " events.");

		//extract a wordset of artists
		var artists_only = [];

		my_artists.forEach(function(artist_genre) {
			artists_only.push(artist_genre.name)

		});

		console.log("-------");
		console.log(artists_only);
		// var fm = new FuzzyMatching(['tough', 'thought', 'through', 'CafÃ©']);
		var fm = new FuzzyMatching(artists_only);



		//console.log(fm.get('tough'));

		var matches = [];

		for (var date in my_performances.dates) {
			if (my_performances.dates.hasOwnProperty(date)) {
				my_performances.dates[date].forEach(function(event){
					event.artists.forEach(function(art){

						//try to match each artist from an event
						var try_match = fm.get(art);

						//todo: what is appropriate distance here?

						if(try_match.distance > .9){
							var match = {};
							match.artists = [];
							match.artists.push(art)
							// match.match = try_match.value
							match.matches = []

							//todo: terrible
							my_artists.forEach(function(artist_genre){
								if(artist_genre.name == try_match.value){
									match.matches.push(artist_genre)
								}
							})
							// match.matches.push(try_match.value)

							match.date = date;
							match.event = event;
							match.eventId = event.id;

							//we want to avoid duplicating a record in matches just b/c we matched on its artists more than once.
							//if the event is already defined in matches, just add artists to match

							var findWithAttr = function(array, attr, value) {
								for(var i = 0; i < array.length; i += 1) {
									if(array[i][attr] === value) {
										return i;
									}
								}
								return -1;
							};

							var index = findWithAttr(matches,"eventId",match.eventId);

							// console.log("=========================");
							// console.log(event);
							// console.log("+++++++++++++++");
							// console.log(match.event)

							if(index === -1){
								matches.push(match)
							}
							else{
								matches[index].artists.push(art)
								matches[index].matches.push(try_match.value)
							}
						}
					})
				})
			}
		}

		console.log("matches.length",matches.length);
		matches = JSON.stringify(matches,null,4);

		fs.writeFile(matchesName, matches, function(err) {

			if(err) {   return console.log(err); }
			else{
				console.log(matchesName + " saved!");
				done()
			}
		});

	})
};

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

var fetch_metro_events = function(metro,dateFilter,raw,areaDatesArtists){

	return new Promise(function(done, fail) {

		dateFilter.start = new Date(dateFilter.start);
		dateFilter.end = new Date(dateFilter.end);


		console.log(dateFilter.start);
		console.log(dateFilter.end);

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

							console.log("--------------------------------");
							console.log("outrange:",outRange.length);
							console.log("new events:",result.events.length);
							console.log("total events:",event_count);
							console.log("paging invariant:",events.length);

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

var fake_events = require('./example data objects/event.js').events;
var fake_metro_events =  function(){
	return new Promise(function(done, fail) {
		console.warn("faking events");
		console.warn(fake_events.length);
		done(fake_events)
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

		if (new Date(req.body.dateFilter.start).getDate() < new Date().getDate()) {
			done({error: "start date is less than current date"})}
		else {
			//testing:
			fake_metro_events()
			//fetch_metro_events(req.body.metro, req.body.dateFilter, req.body.raw_filename, req.body.areaDatesArtists_filename)
				.then(function (results) {

					if (next) {
						next(results)
					} else {
						//console.log(app.jstr(results));

						var metrOb = {metro:req.body.metro,dateFilter:req.body.dateFilter,
							leven_match:[],spotify_match:[],artists:[],payload:[],db:[],
							results:["leven_match","spotify_match","db"]}
						//lastLook:[]

						//todo: how to parallel these? mixing promises here
						var AASMatch = [];

						AASMatch.push(db_mongo_api.insert(results));
						results.forEach(ob =>{
							ob.performance.forEach(p =>{
								var a = {id:p.artist.id,name:p.artist.displayName};
								metrOb.artists.push(a);
								AASMatch.push(db_api.checkDBFor_artist_artistSongkick_match(a))
							})
						});

						console.log("artists",metrOb.artists.length);

						//testing:
						metrOb.artists = metrOb.artists.slice(0,5);

						// 1) check if we know of a match between songkick and spotify ids formed by leven distance already
						// 2) attempt to leven match on all spotify artists
						// 2.b) todo: do Spotify free text artist search?
						// 3) puppet

						//check if we know of a match between songkick and spotify
						Promise.all(AASMatch).then(results => {
								var matchMap = {};
								var LevenMatch = [];
								//todo:
								results.shift();
								//console.log("$artist_artistSongkick",results[0]);

								//make a map of the matches we got so we can filter a payload for step (2)

								results.forEach(r =>{	matchMap[r.artistSongkick_id] = r;})
								metrOb.artists.forEach(a =>{
									!(matchMap[a.id])? LevenMatch.push(db_api.checkDBForArtistLevenMatch(a)):{};
								});

								//todo: have to do something with the ones we matched
								//SHOW-32
								//i.e. push into metrOb.db
								//console.log("$matchMap",matchMap);

								//testing:
								//LevenMatch.push(db_api.checkDBForArtistLevenMatch({name:"earth gang",id:1234324}));

								Promise.all(LevenMatch).then(results => {
									//console.log("$r",results[0]);
									//spotify artist string search

									//todo: MOVE
									var Bottleneck = require("bottleneck");
									var limiterSpotify = new Bottleneck({
										maxConcurrent: 20,
										minTime: 30,
										trackDoneStatus: true
									});

									var searches = [];
									results.forEach(r =>{
										if(!(r.error)){
											//should be artist objects w/ genres
											metrOb.leven_match.push(r);

											//todo: need to evaluate these new matches
											//and commit back to db

											//...

										}else{
											//console.log("$r",r);
											//todo: need this to return the query and result I think
											//might have to look at quality of match as well?
											//searches.push(spotify_api.searchArtist(r.name));
											searches.push(limiterSpotify.schedule(spotify_api.searchArtist,r,{}))
										}
									});


									console.log("db",metrOb.db.length);
									console.log("queries #",searches.length);
									Promise.all(searches).then(results => {
										//look like: {query:query,result:r}
										//console.log("$searches",app.jstr(results[0]));

										results.forEach(r =>{
											var aas,artist,artistSongkick = {};
											if(r.result.body.artists.items.length > 0){
												var item = r.result.body.artists.items[0];	var q = r.query;

												//todo: need to remake this insert to accept entire object
												artist= item;
												artistSongkick= {id:q.id,name:q.name};

												//todo: evaluate integrity of new match
												aas = {id:item.id,name:item.name,artistSongkick_id:q.id,artistSongkick_name:q.name}

												// console.log(artist);
												// console.log(artistSongkick);
												// console.log(aas);

												//todo: somehow the last item.id here is getting replaced with spotify?
												//strange but tired

												//commit to db

												//...

											}
										})


									},error =>{ console.log("$searches",error);})

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


