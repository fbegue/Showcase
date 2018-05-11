/**
 * Created by DICK-SHRIVELER on 2/17/2018.
 */


//repo
//https://github.com/schnogz/songkick-api-node
//All requests to the library will be returned a promise and when resolved the response will be JSON.

const apikey = "pdBY8kzaJtEjFrcw"

const Songkick = require('songkick-api-node');
const fs = require('fs')
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

	//todo: figure out how to handle paging here.

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

						console.log(events.length);


						var past = [];
						var future = [];

						for(var x = 0; x < events.length; x++){
							if(events[x].start.date){
								var date = new Date(events[x].start.date)
								var today = new Date();

								//var m = date.getMonth() + 1
								//var d = date.getDate()
								//var y  = date.getFullYear()
								//console.log(m + " " + d + " " + y );

								if(date > today){  future.push(events[x])  }
								else{ past.push(events[x])  }

							}
						}//events length

						var result = {}
						result.id = metro.id;
						result.displayName = metro.displayName;
						result.events = future;



						all_results.push(result)

						// future.forEach(function(e){
						//     all_results.push(e);
						// });



						all_results.forEach(function(result){
							event_count = event_count + result.events.length;
						});

						console.log("total events:",event_count);
						console.log("invariant:",events.length);


						//todo:
						if(events.length < 50 || page_count === 5){
							// if(events.length < 50){
							console.log("page with len < 50 was reached. stopping.");
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

		var performances = {};
		var dates = [];

		results = results[0];

		var write_schedule = function(){
			results.forEach(function(result){

				//console.log("===============");
				//console.log(result);


				// if(result.displayName == "Columbus"){

				result.events.forEach(function(event){


					//performance is an array of artists (headliner, support, etc)

					//todo: collapse under same date

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


						performances[newDate] = [];
						performances[newDate].push(performance);
					}
					else{
						// performances[newDate].push(performance);

						//todo: tried to eliminate duplicate performances
						// if(performances[newDate].indexOf(performance) == -1){
						// 	performances[newDate].push(performance);
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
			else{ console.log("The file was saved!");}

		});

		var output = {};
		output.area = metro_select.displayName;
		output.events = event_count;
		output.performances = performances;


		json = JSON.stringify(output,null,4)

		fs.writeFile("songkick_artists.json", json, function(err) {

			if(err) {   return console.log(err); }
			else{ console.log("The file was saved!");}

		});

	})

}//get_all_metros_events

get_all_metros_events()

