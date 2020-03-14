let sql = require('mssql');

const msnodesqlv8 =  require("msnodesqlv8");
const conn = new sql.ConnectionPool({
	database: "master",
	//server: "localhost\\SQLEXPRESS",
	server: "localhost\\SQLEXPRESS",
	user:"test",
	password:"test",
	driver: "msnodesqlv8"
	// options: {
	// 	trustedConnection: true
	// }
});

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

connect();

var get_metro_events = function(metro,dateFilter,raw,areaDatesArtists){

	return new Promise(function(done2, fail) {


		//used for stats in return object
		var event_count = 0;

		var get_events = function(metro,page){
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

							///console.log(JSON.stringify(events, null,4));

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

		promises.push(get_events(metro))

		//results is an object with three fields: metro id, displayName (of metro) and the future events in that metro
		Promise.all(promises).then(function(results){

			console.log("finished: ");

			//get list of artists:

			var performance_dates = {};
			var dates = [];

			//todo: because I'm only doing one metro?
			//this is still an array of sets of 50< events
			results = results[0];

			let payload = {};
			let payloads = [];
			let vstr = "";
			//let kstr = "";
			//let klist = ["id", "displayName", "location", "start", "type", "uri", "metro_id"]
			let promises = [];
			let sreq = {};
			let qry = "";

			let varchar_keys = ["displayName"];

			results.forEach(function(result){
				result.events.forEach(function(event){

					varchar_keys.forEach(function(key) {
						if (event[key] && event[key].indexOf("'") !== -1) {
							event[key] = event[key].replace("'", "''");
						}
					});

					//let x = new Date(event.start.datetime).toISOString().slice(0,19).replace('T','')
					let x = new Date(event.start.datetime);

					sreq = new sql.Request(conn);
					sreq.input('id',sql.Int,event.id);
					sreq.input('displayName',sql.NVarChar(150),event.displayName);
					sreq.input('location',sql.NVarChar(50),event.location.city);
					sreq.input('start',sql.DateTimeOffset(7),x);
					sreq.input('type',sql.NVarChar(50),event.type);
					sreq.input('uri',sql.NVarChar(150),event.uri);
					sreq.input('metro_id',sql.Int,results[0].id);
					//todo:payload.venue = event.venue.displayName;

					promises.push(sreq.execute('event_insert'));

					//performances
					let sreq2;

					//todo: somehow I'm getting duplicates of performances?
					//took primary key constraint off of the table b/c I'm tired and this
					//doesn't make any fucking sense at all. but really WTF

					let ids = {};
					event.performance.forEach(function(perf){
						//console.log(perf);

						if(!ids[perf.id]){
							console.log(perf.id);
							ids[perf.id] = perf.id;

							sreq2 = new sql.Request(conn);
							sreq2.input('id',sql.Int,perf.id);
							sreq2.input('displayName',  sql.NVarChar((100),perf.displayName));
							sreq2.input('songkick_artist_id', sql.Int, perf.artist.id);
							sreq2.input('billingIndex', sql.Int,perf.billingIndex);
							sreq2.input('billing',    sql.NVarChar((50), perf.billing));

							promises.push(sreq2.execute('performance_insert'));
						}else{
							console.log("$");
						}

					});
				});
			});

			Promise.all(promises).then(function(results2){

				console.log("SQL commit finished!",results2.length);

				//todo: after I put the rest of the tables together
				sreq = new sql.Request(conn);
				qry = 'select * from events';
				sreq.query(qry).then(function(res){

					console.log("retrieved committed table recordset: ",res.recordset.length);
					done2(res.recordset);
				});

				//todo: never really went back to check and make sure write_schedule is writing
				//JS objects exactly like SQL

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
				console.log("results length: ",results.length);
				console.log("events length: ",event_count);
				console.log("----------------------");

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

	})

}//get_metro_events
