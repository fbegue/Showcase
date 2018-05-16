/**
 * Created by DICK-SHRIVELER on 2/17/2018.
 */


//repo
//https://github.com/schnogz/songkick-api-node
//All requests to the library will be returned a promise and when resolved the response will be JSON.

const apikey = "pdBY8kzaJtEjFrcw"

const Songkick = require('songkick-api-node');
const fs = require('fs')
var FuzzyMatching = require('fuzzy-matching');

const songkickApi = new Songkick(apikey);


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

//find metros from string query

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

			fs.writeFile("songkick.json", json, function (err) {
				if (err) {
					return console.log(err);
				}

				console.log("The file was saved!");
			});

		})

}

//find_metros()

//then get events upcoming for a metro

var get_all_metros_events = function(){


	//todo:
	var event_count = 0;


	var dateFilter = {};
	//dateFilter.start = new Date();
	dateFilter.start = '2018-06-01'
	dateFilter.end = '2018-09-31';


	var get_events = function(metro,page){
		return new Promise(function(done, fail) {
			console.log("get_events");

			var all_results = [];
			var page_count = 0;

			var get = function(){

				var params = {};
				params.page = page_count;
				params.per_page = 50;

				console.log("getting page {" + page_count + "}...");
				songkickApi.getLocationUpcomingEvents(metro.id,params)
					.then(function(events){

						// console.log(events.length);

						var filterInRange = function(event){

							var res = true;
							var eDate = event.start.date;
							// console.log( dateFilter.start + " > "  + eDate +  " < "+ dateFilter.end);
							// console.log( eDate < dateFilter.start)
							// console.log( eDate > dateFilter.end);

							//if start invalid, set false and ignore end value
							//if end invalid, set false and ignore start value unless start is false, then take start

							if(dateFilter.start && dateFilter.end){

								if(eDate < dateFilter.start){
									res = false;
								}

								if(eDate > dateFilter.end || !res){
									res = false;
								}
							}
							else if(dateFilter.start && !dateFilter.end) {
								if(eDate < dateFilter.start){
									res = false;
								}
							}else if(!dateFilter.start && dateFilter.end) {
								if(eDate > dateFilter.end){
									res = false;
								}
							}

							//console.log(":: " + res);
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
						console.log("new events:",result.events.length);
						console.log("total events:",event_count);
						console.log("paging invariant:",events.length);

						//if page length is < 50
						//OR if we're starting to get zero-inrange results back, but we have SOME (for dateFilter.start)

						if(events.length < 50 || (result.events.length === 0 && all_results.length != 0)){

							console.log("invariant tripped. stopping.");
							console.log(result.events.length === 0);
							console.log();
							done(all_results)
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

	var promises = [];
	//metros.forEach(function(metro){
	//    promises.push(get_events(metro))
	//})

	// //todo: one metro only
	var metro_select = metros[2];

	promises.push(get_events(metros[2]))
	//promises.push(get_events( metro_select))


	//results is an object with three fields: metro id, displayName (of metro) and the future events in that metro
	Promise.all(promises).then(function(results){

		console.log("finished: ");


		//get list of artists:

		var performance_dates = {};
		var dates = [];

		results = results[0];


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

					//performance is an array of artists (headliner, support, etc)
					var performance = {};

					var date = new Date(event.start.date)
					var m = date.getMonth() + 1
					var d = date.getDate()
					var y  = date.getFullYear()
					var day = date.getDay();

					var newDate = weekday[day] + ", " + m + "-" + d + "-" + y
					//console.log(m + " " + d + " " + y );

					//perf.date = event.start.date;
					//performance.date = newDate;

					performance.venue = event.venue.displayName;
					performance.artists = [];


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

		write_schedule();

		console.log("----------------------");
		console.log("results length: ",results.length);
		console.log("events length: ",event_count);
		console.log("----------------------");

		var json = JSON.stringify(results,null,4)

		fs.writeFile("songkick.json", json, function(err) {

			if(err) {   return console.log(err); }
			else{ console.log("songkick.json saved!");}

		});

		var output = {};
		output.result = {};

		output.result.area = metro_select.displayName;
		output.result.events = event_count;
		output.result.dates = performance_dates;


		json = JSON.stringify(output,null,4)

		fs.writeFile("songkick_performances.json", json, function(err) {

			if(err) {   return console.log(err); }
			else{
				console.log("songkick_performances.json saved!");


			//todo: compare with fuzzy




			}

		});

	})

}//get_all_metros_events


//todo:
//get_all_metros_events()

var count_properties = function(object){
	var count = 0;
	for (var prop in object) {
		if (object.hasOwnProperty(prop)) {count++}
	}
	return count;
};


var test_fuzzy = function(){

	var my_artists = require("./../authorization_code/public/my_artists.json").artists;
	var my_performances = require("./songkick_performances.json").result;

	console.log(my_artists.length + " spotify artists.");
	console.log(count_properties(my_performances.dates) + " unique dates.");
	console.log(my_performances.events + " events.");

	// var fm = new FuzzyMatching(['tough', 'thought', 'through', 'CafÃ©']);
	var fm = new FuzzyMatching(my_artists);

	//console.log(fm.get('tough'));

	var matches = [];

	for (var date in my_performances.dates) {
		if (my_performances.dates.hasOwnProperty(date)) {
			my_performances.dates[date].forEach(function(perf){
				perf.artists.forEach(function(art){

					var try_match = fm.get(art);

					if(try_match.distance > .8){
						var match = {};
						match.art = art;
						match.match = try_match.value
						match.date = date;
						match.perf = perf;
						matches.push(match)
					}
				})
			})
		}
	}

	console.log("matches.length",matches.length);
	matches = JSON.stringify(matches,null,4);

	fs.writeFile("matches.json", matches, function(err) {

		if(err) {   return console.log(err); }
		else{
			console.log("matches.json saved!");
		}
	});
};

//test_fuzzy();

var test_promise = function(){

	var func_1 = function(func1_in){
	    return new Promise(function(done, fail) {

			console.log("func1_in",func1_in);

			setTimeout(function(){

				func1_in.ind1++;

				console.log("func1_in result",func1_in);
				done(func1_in)

				}, 1000);

	    })
	};

	var func_2 = function(func2_in){
		return new Promise(function(done, fail) {

			console.log("func2_in",func2_in);

			setTimeout(function(){

				func2_in.ind1++;

				console.log("func2_in result",func2_in);
				done(func2_in)

			}, 3000);

		})
	};

	var requests = [
		{"id":1,"ind1":10,"ind2":100},
		{"id":2,"ind1":20,"ind2":200},
		{"id":3,"ind1":30,"ind2":300},
	];

	var promiseTrack = new Promise(function(resolved) {
		console.log("Start...");
		resolved();
	});

	requests.forEach(function(value, i) {

		promiseTrack = promiseTrack.then(function() {
			return (func_1(value))
				 // .then(func_2(value))
		});
	});
	promiseTrack.then(function(finish) {
		console.log("...finish",finish);

	})
		.catch(function(err){
			console.log("err: ",err);
		});
}

test_promise()