(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
		/**
		 * Created by begue.16 on 9/27/2017.
		 */

//sourced from:

//examples:
//https://developer.spotify.com/web-api/code-examples/

//repo for playlist creator

//https://github.com/possan/playlistcreator-example/blob/master/app.js
//https://github.com/possan/playlistcreator-example/blob/master/index.html

// handled by browserify
		var FuzzyMatching = require('fuzzy-matching');

		var global_user = {};
//
// var module = angular.module('playlistGen', []);
// var controller = module.controller("myCtrl", function($scope,$http) {
// 	console.log("myCtrl");
// 	$scope.test = "test";
//
// 	let getData = function () {
// 		return  $http.get('friends_id_map.json');
// 	};
//
// 	getData().then(function(data) {
// 		console.log(data) ;
// 		$scope.users = data.data.friends;
// 		console.log($scope.users);
// 		//$scope.$apply();
// 	});
//
// 	var make_request_local =  function(url_object,cache){
//
// 		return new Promise(function(done, fail) {
//
// 			var url_local = "http://localhost:8888/";
// 			console.log("sending request : " + url_object.type + " :: " + url_object.url);
// 			$.ajax({
// 				url: url_local + url_object.url,
// 				type:url_object.type
// 			}).done(function(payload){
//
// 				console.log("retrieved: ",payload);
// 				done(payload);
//
// 			})
// 				.fail(function(err){
//
// 					console.log("there was a problem: ");
// 					console.log(err);
// 				})
// 		})
//
// 	}; //make_request
//
// 	$scope.testEndpoint = function(){
//
// 		var req = {};
// 		req.type = "GET";
// 		req.url = "test";
//
// 		make_request_local(req).then(function(result){
//
// 			console.log("result",result);
//
// 			console.log("testEndpoint finished!");
// 		})
// 	};
//
// 	$scope.set_user = function(user){
// 		console.log("set user:",user)
// 		global_user = user;
// 	}
//
//
// })


		var global_access_token = {};



		/**
		 * Obtains parameters from the hash of the URL
		 * @return Object
		 */

		var getHashParams = function() {
			//console.log("getHashParams");
			var hashParams = {};
			var e, r = /([^&;=]+)=?([^&;]*)/g,
				q = window.location.hash.substring(1);
			while ( e = r.exec(q)) {
				hashParams[e[1]] = decodeURIComponent(e[2]);
			}
			return hashParams;
		};

		var findWithAttr = function(array, attr, value) {
			for(var i = 0; i < array.length; i += 1) {
				if(array[i][attr] === value) {
					return i;
				}
			}
			return -1;
		};

		var sleeper = function(ms) {
			return function(x) {
				return new Promise(resolve => setTimeout(() => resolve(x), ms));
			};
		}

		var count_properties = function(object){
			var count = 0;
			for (var prop in object) {
				if (object.hasOwnProperty(prop)) {count++}
			}
			return count;
		};

//todo: how does this work? all exports formatted like this are available to the page by default? idk

		if (typeof(window) !== 'undefined') {

			(function(exports) {


				var module = angular.module('showcase', []);

				let global_familyColor_map = {};
				global_familyColor_map["pop"] = '#386ffd';
				global_familyColor_map["electro house"] = 'rgb(214, 196, 36)';
				global_familyColor_map["rock"] = 'orange';
				global_familyColor_map["hip hop"] = 'lightblue';
				global_familyColor_map["r&b"] = '#10a010';
				global_familyColor_map["latin"] = 'lightgreen';
				global_familyColor_map["folk"] = '#C5B0D5';
				global_familyColor_map["country"] = '#D62728';
				global_familyColor_map["metal"] = '#FF9896';
				global_familyColor_map["punk"] = '#9467BD';
				global_familyColor_map["blues"] = '#8C564B';
				global_familyColor_map["reggae"] = 'tan';
				global_familyColor_map["world"] = 'pink';
				global_familyColor_map["jazz"] = '#a87373';
				global_familyColor_map["classical"] = 'grey';

				let globalFamilies =  ["pop", "electro house", "rock", "hip hop", "r&b", "latin", "folk", "country", "metal", "punk", "blues", "reggae", "world", "jazz", "classical"]

				let global_familyImageMap = {}
				global_familyImageMap["pop"] =  "images/002-karaoke.svg";
				global_familyImageMap["electro house"] =  "images/001-speaker.svg";
				global_familyImageMap["rock"] =  "images/025-band-1.svg";
				global_familyImageMap["hip hop"] =  "images/005-dj-mixer.svg";
				global_familyImageMap["r&b"] = "images/006-quavers-pair.svg";
				global_familyImageMap["latin"] = "images/008-maracas.svg";
				global_familyImageMap["folk"] = "images/009-banjo.svg";
				global_familyImageMap["country"] =  "images/010-guitar.svg";
				global_familyImageMap["metal"] = "images/011-electric-guitar-for-heavy-metal.svg";
				global_familyImageMap["punk"] =  "images/015-face-with-hair-and-eyeglasses.svg";
				global_familyImageMap["blues"] =  "images/003-electric-guitar.svg";
				global_familyImageMap["reggae"] = "images/018-bongo.svg";
				global_familyImageMap["world"] = "images/020-worldwide.svg";
				global_familyImageMap["jazz"] =  "images/017-saxophone.svg";
				global_familyImageMap["classical"] =  "images/022-grand-piano.svg";


				//todo: only designed for two people

				//todo: changed user_cache
				module.filter('sharedFilter', function()  {
					return function(input,type,shared) {

						//console.log(shared[type]);
						if(shared[type]){
							let output = [];
							let users = Object.keys(user_cache);
							console.log(users);

							if(type === 'artists'){

								user_cache[users[0]].artists.simple.forEach(function(art1){
									user_cache[users[1]].artists.simple.forEach(function(art2){
										if(art1.name === art2.name){
											output.indexOf(art1) === -1 ? output.push(art1):{};
										}
									})

								})
							}
							else if(type === 'genres'){
								user_cache[users[0]].genres.forEach(function(g1){
									user_cache[users[1]].genres.forEach(function(g2){
										if(g1 === g2){
											output.indexOf(g1) === -1 ? output.push(g1):{};
										}
									})

								})
							}
							return output;
						}

						else{return input}
					};
				});

				//todo: changed user_cache
				module.filter('hasGenre', function()  {
					return function(input,filterGenre,user_cache) {
						let output = [];

						if(input === undefined){
							return input;
						}
						else{

							console.log(input);
							console.log(filterGenre);
							console.log(user_cache);

							input.forEach(function(event){
								event.performance.forEach(function(p){
									let spotId = user_cache.global.artistsSongkickSpotifyMap[p.artist.id];
									let genres;
									user_cache.global.artistsInfoMap[spotId] ? genres = user_cache.global.artistsInfoMap[spotId].genres:genres = [];
									if (genres.indexOf(filterGenre) !== -1 && output.indexOf(event) === -1) {
										output.push(event)
									}
								})
							});
						}

						console.log(output);
						return output;
					};
				});

				//todo: need to not display a PERFORMANCE if I don't care about underlying ARTIST

				//todo: changed user_cache
				module.filter('myArtists', function() {
					return function(input,user) {

						let output = [];
						user_cache[user.id].artists.simple.forEach(function(art1){
							input.forEach(function(art2){
								if(art1.name === art2.name){
									output.indexOf(art1) === -1 ? output.push(art1):{};
								}
							})
						});
					}});



				module.filter('orderByArtistFreq', function () {
					return function (input,user_artist_freq_map) {
						input.sort(function (a, b) {
							return user_artist_freq_map[b.artist_id] - user_artist_freq_map[a.artist_id];
						});
						return input;
					};
				});

				module.factory('linker', function () {
					var links = {}
					return function (arr, key) {
						var link = links[key] || []


						arr.forEach(function (newItem, index) {
							var oldItem = link[index]
							if (!angular.equals(oldItem, newItem))
								link[index] = newItem
						})

						link.length = arr.length

						return links[key] = link
					}
				})

				//todo: this is some weird shit alright.
				//http://next.plnkr.co/edit/2Uc5zsFgVnK3ltHOUUQx?p=preview&preview
				//https://railsguides.net/fix-angular-digest-iteration-errors-with-memoization/

				//this doesn't use the linker, but probably has some weird stuff going on outside of
				//the 'i need to initialize so the first n number runs always have undefined'

				//what is my actual goal here? I want to be able to 'bind database calls to ng-repeats'
				//I know I could (easily?) make stable containers for everything, and then use functions
				//to update the contents of these containers. but I don't want to have to dynamically declare
				//these when the app grows, I want to be able change things in the database and call
				//one master function that says 'everyone that data changed, re-run your queries.
				module.filter('getPerfs', function() {
					return function(perfs,e) {

						//console.log("@change");
						//console.log(events);
						//console.log(e);

						let qry = "select * from events e"
							+ " JOIN events_performances ep on e.id = ep.event_id"
							+ " JOIN performances p on p.id = ep.performance_id"
							+ " where e.id = " + e.id;

						!e.performances ? e.performances = alasql(qry):{};

						if(e && perfs){
							let array = perfs.map(function (item) {
								item.performances = alasql(qry)
								//console.log(item.performances);
								return item;
							});

							console.log("getPerfs",array);
							return array
						}
						else{return perfs;}
					};
				});


				let events = {};
				// module.filter('getEvents', function(linker) {
				// 	return function(perfs) {
				// 		let output = [];
				//
				// 		perfs.forEach(function (p) {
				// 			!events[p.event_id] ? events[p.event_id] = [] : {};
				// 			events[p.event_id].push(p);
				// 		})
				//
				// 		let perf = {};
				// 		let perfKeys = ["id", "displayName", "type", "uri", "start", "location",
				// 			"metro_id", "event_id", "performance_id", "billing", "billingIndex",
				// 			"artistSongkick_id"]
				//
				// 		Object.keys(events).forEach(function (eventId) {
				//
				//
				// 			perf.
				// 			output.push(perf)
				// 		});
				//
				// 		return output;
				// 	}})


				//todo: deprecated
				// module.filter('getGenres', function(linker) {
				// 	return function(genres,p) {
				//
				// 		// console.log("@getGenres");
				// 		// console.log(genres);
				// 		// console.log(p);
				//
				// 		let t = alasql("select * from artist_artistSongkick");
				// 		// console.log(t);
				// 		// console.log(alasql("select * from artist_artistSongkick aas join artists a on aas.artist_id = a.id"));
				//
				// 		//todo: no idea why this wasn't able to go get the actual genre object but whatever
				// 		let qry = "select * from performances p"
				// 			+ " JOIN artist_artistSongkick aas on p.artistSongkick_id = aas.artistSongkick_id"
				// 			+ " JOIN artists_genres ag on aas.artist_id = ag.artist_id"
				// 			// // + " JOIN artists a on aas.artist_id = a.id"
				// 			// + " JOIN genres g on ag.genre_id = g.id"+
				// 			+ " where aas.artistSongkick_id = " + p.artistSongkick_id;
				//
				// 		let qryResult = alasql(qry);
				// 		//console.log(p.artistSongkick_id + "::",alasql(qry));
				//
				//
				// 		let gens = [];
				//
				//
				// 		// if(qryResult.length > 0){
				// 		// 	let test = {};
				// 		// 	test = qryResult[0]["genre_id"]
				// 		// 	gens = alasql("select * from genres where id = " + test)
				// 		// 	console.log("gens",gens);
				// 		// }
				// 		// else{
				// 		// 	console.log("skipped: ",p.artistSongkick_id);
				// 		// 	console.log(qryResult);
				// 		// }
				//
				// 		!p.genres ? p.genres = gens:{};
				//
				// 		if(p && genres){
				// 			let array = genres.map(function (item) {
				// 				item.genres = gens;
				// 				console.log(item.genres);
				// 				return item;
				// 			});
				// 			return array
				// 		}
				// 		else{return genres;}
				// 	};
				// });

				module.filter('startFrom', function() {
					return function(input, start) {
						start = +start; //parse to int
						return input.slice(start);

						// if(!input){
						// 	return input;
						// }
						// else{
						// 	start = +start; //parse to int
						// 	return input.slice(start);
						// }

					}
				});



				//todo: combine with orderByGenre so that they are grouped by family, but within
				//each family they are ordered by frequency. also either need to make a manual way
				//of ordering the families, or by default sort the family's order by the totals of their genres

				// module.filter('orderByGenreFreq', function () {
				// 	return function (input,user_genre_freq_map) {
				// 		input.sort(function (a, b) {
				// 			return user_genre_freq_map[b.genre_id] - user_genre_freq_map[a.genre_id];
				// 		});
				// 		return input;
				// 	};
				// });


				module.filter('thisFamily', function () {
					return function (input,familyName) {
						//given a bunch of genres with family names registered (POSSIBLY multiple)
						// only return the genres that are from the family, of the families we're iterating thru
						let output = [];
						input.forEach(function (g) {
							if (g.family.length > 0 && g.family.indexOf(familyName) !== -1){
								output.push(g);
							}
						});
						return output
					}
				});


				module.filter('byFamilyFreq', function () {
					return function (input,user,family_frequency_fetch,ucachegenres) {
						//console.log("byFamilyFreq",ucachegenres.length);

						if(ucachegenres.length !== 0){
							let output = JSON.parse(JSON.stringify(input));
							output.sort(function (a, b) {
								let freq_a = family_frequency_fetch(a,user)
								let freq_b = family_frequency_fetch(b,user)
								return freq_a < freq_b ? 1 : -1
							});
							return output
						}else{
							return input}
					}
				});

				// module.filter('byFamilyFreq', function () {
				// 	return function (input,user,usersGenres,family_freq_map) {
				// 		console.log("byFamilyFreq",usersGenres.length);
				// 		let output = JSON.parse(JSON.stringify(input));
				// 		if(usersGenres.length !== 0) {
				// 			output.sort(function (a, b) {
				// 				return (family_freq_map[user.id][a] < family_freq_map[user.id][b]) ? 1 : -1
				// 			})
				// 		}
				// 		return output
				// 	}
				// });

				// module.filter('byGenreFreq', function () {
				// 	return function (input,user,genre_freq_map) {
				// 		input.sort(function(a,b){
				// 			return (genre_freq_map[user.id][a.genre_id] < genre_freq_map[user.id][b.genre_id]) ? 1: -1
				// 		})
				// 		return input
				// 	}
				// });

				module.filter('byGenreFreq', function () {
					return function (input,user,genre_frequency_fetch,ucachegenres) {
						//console.log("byGenreFreq",ucachegenres.length);

						if(ucachegenres && ucachegenres.length !== 0){
							//console.log("sorted");
							//let output = JSON.parse(JSON.stringify(input));
							input.sort(function (a, b) {
								let freq_a = genre_frequency_fetch(a,user)
								let freq_b = genre_frequency_fetch(b,user)
								return freq_a.length < freq_b.length ? 1 : -1
							});
							return input
						}else{
							return input}
					}
				});

				let controller = module.controller("myCtrl", function($scope,$http,linker) {



				   $scope.vmapSelection = [];

				   $scope.selectMetro = function(metroId){
					   $scope.metros.forEach(function(m){
						   if( m.id === metroId){$scope.global_metro = m}
					   });
					   console.log("set global_metro",$scope.global_metro);
					   $scope.digestIt();
				   };

					$(document).ready(function () {
						$('#vmap').vectorMap({
							map: 'usa_en',
							backgroundColor: null,
							borderColor: 'black',
							color: 'lightgrey',
							selectedColor:  'darkgrey',
							hoverColor: 'darkgrey',
							enableZoom: false,
							showTooltip: false,
							multiSelectRegion:true,
							colors: {
								oh: 'lightblue',
								ut: 'lightblue',
								ca: 'lightblue'
							},
							onRegionClick: function(event, code, region){
								//the event comes from vmap silly :)
								//event.preventDefault();

								console.log("hey!",code + "|" + region);
							},
							onRegionSelect: function(event, code, region){
								console.log("onRegionSelect!",code);
								$scope.vmapSelection.push(code)
								console.log($scope.vmapSelection);
								$scope.digestIt();
							},
							onRegionDeselect: function(event, code, region){
								console.log("onRegionDeselect!",code );
								let i = $scope.vmapSelection.indexOf(code)
								$scope.vmapSelection.splice(i,1);
								console.log($scope.vmapSelection);
								$scope.digestIt();
							}
							// showLabels:true,

							// hoverColor: 'lightgrey',
							// multiSelectRegion:true,
							// selectedRegions: ['CA','NY'],

						});
					});


					// setTimeout(function(){
					//
					// 	 console.log("$time!");
					// 	var pins = $('#vmap').vectorMap('getPins');
					// 	console.log(pins);
					//
					// 	// let hi = $("#jqvmap1_hi")
					// 	// console.log(hi);
					// 	// hi.attr("fill", "#374659");
					//
					//
					// 	// $('#vmap').vectorMap({
					// 	// 	map: 'usa_en',
					// 	// 	enableZoom: true,
					// 	// 	showTooltip: true,
					// 	// 	selectedColor: null,
					// 	// 	hoverColor: null,
					// 	// 	colors: {
					// 	// 		mo: '#C9DFAF',
					// 	// 		fl: '#C9DFAF',
					// 	// 		or: '#C9DFAF'
					// 	// 	},
					// 	// 	onRegionClick: function(event, code, region){
					// 	// 		event.preventDefault();
					// 	// 	}
					// 	// });
					//
					// },2000);



					//section: DB SETUP AND TESTING
					//creation,object definitions tests for table inserts
					//===========================================================================================

					//examples

					//you can't store things like this, just convert them on selects
					// alasql.fn.datetime = function(dateStr) {
					// 	var date = new Date(dateStr);
					// 	return date.toLocaleString();
					// };

					//alasql("CREATE TABLE cities (city string, pop number, date string)");
					// alasql("INSERT INTO cities VALUES ('Paris',2249975),('Berlin',3517424),('Madrid',3041579)");
					//let x = new Date().toISOString();
					//alasql("INSERT INTO cities VALUES ('Paris',2249975, '" + x +"')");

					//var res = alasql("SELECT * FROM cities WHERE pop < 3500000 ORDER BY pop DESC");
					//var res = alasql('SELECT date ,city FROM cities');

					let vlister = function(object){

						//	console.log("$vlist",object);
						let output = Object.values(object).map(function(value){
							// console.log(object);
							//console.log(value);
							if(typeof value === 'object' && value !== null){
								//console.log("object");
								return '@'+JSON.stringify(value)
							}
							//todo: this means 'undefined'
							else if(value === null){return "null"}
							else{
								return "'" + value + "'"
							}
						}).join(",");

						//console.log("$out",output);
						return output
					};

					let defStr = function(def){
						let defStr = "";
						Object.keys(def).forEach(function(key,i){
							defStr = defStr + key + " " + def[key];
							if(Object.keys(def).length !== i + 1){defStr = defStr + ", "}
						});
						return defStr;
					};


					//todo: trying to gurantee property order on insert? should probably just make this an array or something
					//I think this is working but it probably shouldn't be?
					let temp = {};
					let reduce = function(def,record){
						// console.log(def);
						// console.log(record);
						// console.log(dkeys);
						// console.log(rkeys);

						temp = {};
						let dkeys = Object.getOwnPropertyNames(def);
						let rkeys = Object.getOwnPropertyNames(record)

						Object.assign(temp,record);
						rkeys.forEach(function(rk){
							delete record[rk]
						});
						dkeys.forEach(function(df){
							record[df] = temp[df]
						});

						return record;
					};


					let eventDef,performanceDef, artistDef, artists_genresDef, playlistDef, playlists_artistsDef,
						playlists_tracksDef, artists_tracksDef, trackDef,artist_artistSongkickDef;

					let create_defs = function(){

						eventDef = {
							id:"number",
							metro_id:"number",
							displayName:"string",
							type:"string",
							location:"string",
							venue:"string",
							// start:"string",
							date:"string",
							datetime:"string",
							uri:"string",
						};

						performanceDef = {
							id:"number",
							displayName:"string",
							billing:"string",
							billingIndex:"number",
							artistSongkick_id:"number",
						};

						artist_artistSongkickDef = {
							artist_id:"string",
							artistSongkick_id:"number"
						};


						// let events_performancesDef = {
						// 	event_id:"number",
						// 	performance_id:"number"
						// };


						//todo: images relation table
						artistDef = {
							id:"string",
							name: "string",
							popularity: "number",
							uri: "string"
						};

						//genreDef

						artists_genresDef = {
							artist_id:"string",
							genre_id: "number"
						};

						//todo: collaborative,tracks,images
						playlistDef = {
							id:"string",
							name:"string",
							//owner.display_name
							owner:"string",
							public:"boolean",
							uri:"string"
						};

						playlists_artistsDef = {
							playlist_id:"string",
							artist_id:"string"
						};

						playlists_tracksDef = {
							playlist_id:"string",
							track_id:"string"
						};

						artists_tracksDef = {
							artist_id:"string",
							track_id:"string"
						};

						//todo: very minimal
						trackDef = {
							id:"string",
							name:"string"
						};

					};
					create_defs();

					let createDB = function(){


						let eventDefStr = defStr(eventDef);

						let event_ex = {
							id:36490829,
							metro_id:9480,
							displayName:'Beppe Gambetta at United Church of Granville (February 3, 2019)',
							type:'Concert',
							location:'Granville, OH, US',
							venue:"The Basement",
							date:"2019-04-11",
							datetime:"2019-04-11T19:30:00-0400",
							uri:'http://www.songkick.com/concerts/36490829-beppe-gambetta-at-united-church-of-granville?utm_source=47817&utm_medium=partner',
						};

						alasql("CREATE TABLE events (" + eventDefStr + ")");
						//alasql("INSERT INTO events VALUES ( " + vlister(event_ex)  + " )");
						let res = alasql("select * from events;");
						console.log("$res",res);

						let performanceCol ="id number, displayName string, artistSongkick_id number, billingIndex number,billing string";

						let performanceDefStr = defStr(performanceDef);

						let  performance_ex = {
							id:69550639,
							displayName:'Beppe Gambetta',
							artistSongkick_id:468935,
							billingIndex: 1,
							billing:'headline'
						};
						let  performance_ex2 = {
							id:69559999,
							displayName:'Beppe Gambetta2',
							artistSongkick_id:468935,
							billingIndex: 1,
							billing:'headline'
						};

						alasql("CREATE TABLE performances (" + performanceDefStr + ")");
						//alasql("INSERT INTO performances VALUES ( " + vlister(performance_ex)  + " )");
						//alasql("INSERT INTO performances VALUES ( " + vlister(performance_ex2)  + " )");
						let res2 = alasql("select * from performances;");
						console.log("$res",res2);


						let events_performancesCol ="event_id number, performance_id number";

						let  event_performance_ex = {
							event_id:36490829,
							performance_id:69550639
						};
						let  event_performance_ex2 = {
							event_id:36490829,
							performance_id:69559999
						};

						alasql("CREATE TABLE events_performances (" + events_performancesCol + ")");
						//alasql("INSERT INTO events_performances VALUES ( " + vlister(event_performance_ex)  + " )");
						//alasql("INSERT INTO events_performances VALUES ( " + vlister(event_performance_ex2)  + " )");
						let res3 = alasql("select * from events_performances;");
						console.log("$res",res3);

						let res4 = alasql("select * from events e JOIN events_performances ep on e.id = ep.event_id JOIN performances p on p.id = ep.performance_id");
						console.log("res4",res4);

						let artist_artistSongkick_ex = {

							artist_id:"5GUGxro2Pm4WQhosHxtDiG",
							artistSongkick_id:9453904
						};

						let artist_artistSongkickDefStr = defStr(artist_artistSongkickDef);
						console.log(artist_artistSongkickDefStr);
						alasql("CREATE TABLE artist_artistSongkick (" + artist_artistSongkickDefStr + ")");
						//alasql("INSERT INTO artist_artistSongkick VALUES ( " + vlister(artist_artistSongkick_ex)  + " )");
						console.log("select * from artist_artistSongkick;",alasql("select * from artist_artistSongkick;"));

						let artist_ex = {
							id: "070kGpqtESdDsLb3gdMIyx",
							name: "Easton Corbin",
							popularity: 62,
							uri: "spotify:artist:070kGpqtESdDsLb3gdMIyx"
						};

						let artistDefStr = defStr(artistDef);

						//todo:
						let test = "id string PRIMARY KEY, name string, popularity number, uri string"
						console.log(artistDefStr);
						alasql("CREATE TABLE artists (" + artistDefStr + ")");
						//alasql("INSERT INTO artists VALUES ( " + vlister(artist_ex)  + " )");

						let res5 = alasql("select * from artists;");
						console.log("$res",res5);

						let genreDef = {
							id:"number",
							name: "string",
							family:"json"
						};

						let genre_ex = {
							id:null,
							name: "country rock",
							family:['country','rock']
						};

						let genreDefStr = "id number , name string, family json";
						alasql("CREATE TABLE genres (" + genreDefStr + ")");

						//example using json
						//https://github.com/agershun/alasql/wiki/JSON
						//alasql("INSERT INTO genres VALUES (null,'country rock',@['country','rock'])");

						//alasql("INSERT INTO genres VALUES ( " + vlister(genre_ex)  + " )");

						console.log("select * from genres;",JSON.stringify(alasql("select * from genres;"),null,4));

						let artists_genres_ex = {
							artist_id:"070kGpqtESdDsLb3gdMIyx",
							genre_id: 1
						};

						let artists_genresDefStr = defStr(artists_genresDef);
						alasql("CREATE TABLE artists_genres (" + artists_genresDefStr + ")");
						//alasql("INSERT INTO artists_genres VALUES ( " + vlister(artists_genres_ex)  + " )");

						console.log("select * from artists_genres;",alasql("select * from artists_genres;"));

						let join = alasql("select * from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id");
						console.log("join artists, genres",join);


						let track_ex = {
							id:"4a1s4abQkfbaLkWBn6uMLf",
							name:"This Far From Memphis"
						};

						let trackDefStr = defStr(trackDef);
						alasql("CREATE TABLE tracks (" + trackDefStr + ")");
						//alasql("INSERT INTO tracks VALUES ( " + vlister(track_ex)  + " )");
						console.log("select * from tracks;",alasql("select * from tracks;"));

						let artists_tracks_ex = {
							artist_id:"070kGpqtESdDsLb3gdMIyx",
							track_id:"4a1s4abQkfbaLkWBn6uMLf"
						};

						let artists_tracksDefStr = defStr(artists_tracksDef);
						alasql("CREATE TABLE artists_tracks (" + artists_tracksDefStr + ")");
						//alasql("INSERT INTO artists_tracks VALUES ( " + vlister(artists_tracks_ex)  + " )");
						console.log("select * from artists_tracks;",alasql("select * from artists_tracks;"));

						let join3 = alasql("select * from artists a JOIN artists_tracks at on a.id = at.artist_id JOIN tracks t on t.id = at.track_id");
						console.log("join artists, tracks",join3);


						let playlists_ex = {
							id: "5vDmqTWcShNGe7ENaud90q",
							name: "Classic Rock/Rock",
							owner:"Jake Lavender",
							public: true,
							uri: "spotify:user:1292167736:playlist:5vDmqTWcShNGe7ENaud90q"
						};


						let playlistsDefStr = defStr(playlistDef);
						alasql("CREATE TABLE playlists (" + playlistsDefStr + ")");
						//alasql("INSERT INTO playlists VALUES ( " + vlister(playlists_ex)  + " )");

						console.log("select * from playlists;",alasql("select * from playlists;"));


						let playlists_artists_ex = {
							playlist_id:"5vDmqTWcShNGe7ENaud90q",
							artist_id:"070kGpqtESdDsLb3gdMIyx"
						};


						let playlists_artistsDefStr = defStr(playlists_artistsDef);
						alasql("CREATE TABLE playlists_artists (" + playlists_artistsDefStr + ")");
						//alasql("INSERT INTO playlists_artists VALUES ( " + vlister(playlists_artists_ex)  + " )");

						console.log("select * from playlists_artists;",alasql("select * from playlists_artists;"));

						//let join2 = alasql("select * from playlists p JOIN playlists_artists pa on p.id = pa.playlist_id JOIN artists a on a.id = pa.artist_id");
						//console.log("join playlists, artists",join2);



						let playlists_tracks_ex = {
							playlist_id:"5vDmqTWcShNGe7ENaud90q",
							track_id:"4a1s4abQkfbaLkWBn6uMLf"
						};

						let playlists_tracksDefStr = defStr(playlists_tracksDef);
						alasql("CREATE TABLE playlists_tracks (" + playlists_tracksDefStr + ")");
						//alasql("INSERT INTO playlists_tracks VALUES ( " + vlister(playlists_tracks_ex)  + " )");
						console.log("select * from playlists_tracks;",alasql("select * from playlists_tracks;"));

						let join4 = alasql("select * from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id JOIN tracks t on t.id = pt.track_id");
						console.log("join playlists, tracks",join4);


						//todo: artist_artistSongkick ? what's the point if its not persistant tho...

					};
					createDB();


					//section: INITIALIZATION & UTILITIES
					//===========================================================================================

					let url_local = 'http://localhost:8888/';
					$scope.localStorage = window.localStorage;

					$scope.sortType = "genreGroup";
					$scope.wikiQry = "Guns N' Roses";
					$scope.googleQry = "Moon Hooch";

					//todo: figure out how to query this table with my spotify-gathered genres
					console.warn("imported locally:",all_genres);
					$scope.familyGenre_map = {};
					$scope.genreFam_map = {};
					$scope.familyColor_map = global_familyColor_map;
					$scope.globalFamilies = globalFamilies;
					$scope.global_familyImageMap = global_familyImageMap;

					all_genres.forEach(function(t){
						t.family.forEach(function(f){
							if(!$scope.familyGenre_map[f]){
								$scope.familyGenre_map[f] = [];
							}
							$scope.familyGenre_map[f].push(t.name)
						});
						$scope.genreFam_map[t.name] = t.family

					});

					console.log("familyGenre_map",$scope.familyGenre_map);
					console.log("genreFam_map",$scope.genreFam_map);

					$scope.user_cache = {};
					$scope.user_cache_ctrl = {};
					$scope.genre_freq_map = {};
					$scope.artist_freq_map = {};
					$scope.family_freq_map = {};

					$scope.global_metro = {};
					$scope.global_user = {};

					//todo: default jake
					$scope.global_user = {
						"display_name": "Jake Lavender",
						"id": "1292167736"
					};

					$scope.metro_cache = {};
					$scope.metro_cache_performances = {}

					$scope.dateFilter= {};
					//$scope.dateFilter.end = "";
					//$scope.dateFilter.start = "";
					// $scope.dateFilter.end =  '2019-04-04';
					// $scope.dateFilter.start = '2019-03-04';
					$scope.dateFilter.start =  '2019-04-10';
					// $scope.dateFilter.end =  '2019-04-18';
					// $scope.dateFilter.end =  '2019-04-26';
					$scope.dateFilter.end =  '2019-04-17';
					//$scope.dateFilter.end = '2019-04-11';
					// $scope.raw_filename = "";
					// $scope.areaDatesArtists_filename= "";


					$scope.testG = function(){
						$http.get("google.com").then(function(res){


						});//search_artists post
					}


					//for managing my own pagination on events
					$scope.currentPage = 0;
					$scope.pageSize = 20;
					$scope.numberOfPages=function(){
						//.length > 0
						if($scope.metro_cache[$scope.global_metro.id].events){
							return Math.ceil($scope.metro_cache[$scope.global_metro.id].events.length/$scope.pageSize);
						}
						else{
							return 0;
						}
					};


					var off = "&offset=";
					var lim = "&limit=";
					var offset_base = 50;
					var page_num = 0;

					//todo: needs to be moved to spotify.js
					/**
					 * Designed for paging requests
					 **/
					let make_request =  function(url_object,cache,sleep){

						return new Promise(function(done, fail) {

							var url = url_object.url + "?" + url_object.fields + off + url_object.offset + lim + url_object.limit;

							console.log("sending request",url);

							let params = getHashParams();
							global_access_token = params.access_token
							let call = () =>{
								$.ajax({
									dataType: 'json',
									beforeSend: function (request) {
										request.setRequestHeader("Authorization", 'Bearer ' + global_access_token);
										//var temp_token = "BQClTYekdyT4Fyt3yXsEv6BUfzSly9ihQm1FI6NusqXxeefaxaT0mAuCDL1efdF2HzZKKYqzJw1bMlDQwS9pUZqdZ4ysTDy5oVpCefsNv-O5_9KiYW87lpEZXNRKRQ_YqRKHuuf3RnlTArsBMCuZfU3B6w"
										//request.setRequestHeader("Authorization", 'Bearer ' + temp_token );
									},
									url: url,
								}).done(function(payload){

									console.log("payload page " + page_num,payload);
									// console.log(JSON.stringify(payload,null,4));

									var results = payload["items"]
									results.forEach(function(result){cache.push(result)})

									if(results.length === 50){
										page_num++;
										url_object.offset = url_object.offset + offset_base ;

										console.log("new offset: ", url_object.offset);
										console.log("records length: ", cache.length);

										//todo: not really sure what I was thinking here...

										make_request(url_object,cache).then(function(){
											// console.log("finished multipart fetch I guess?",cache.length);
											done(cache)
										})
									}
									else{
										console.log("finished, # of records: " + cache.length);
										console.log(cache);
										done(cache)
									}

								}).fail(function(err){

									console.log("there was a problem: ");
									console.log(err);
								})
							}//call

							if(sleep){
								console.log("sleeping",sleep)
								setTimeout(() =>{call()},sleep)
							}
							else{call()}
						})//promise
					}; //make_request

					let d3_launch = function(){
						var json_data = {
							"name": " ",
							"children": [
								{
									"name": "Interactive tools",
									"free": true,
									"description": "Interactive authoring tools",
									"children": [
										{
											"name": "Browser-based",
											"description": "Web-based 'cloud' applications for authoring data visualisations",
											"free": true,
											"children": [
												{
													"name": "Datawrapper",
													"description": "An open-source platform for publishing charts on the web. Cloud-based or self-hosted.",
													"url": "https://datawrapper.de/",
													"free": true
												},
												{
													"name": "Google Sheets",
													"description": "Spreadsheet in the cloud with charting",
													"free": true
												},
												{
													"name": "plotly",
													"description": "Cloud-based interactive tool for creating data visualisations",
													"url": "https://plot.ly/",
													"free": true
												},
												{
													"name": "RAW",
													"description": "Open-source interactive tool for creating and exporting D3-like charts",
													"url": "http://raw.densitydesign.org/",
													"free": true
												}
											]
										},
										{
											"name": "Desktop",
											"children": [
												{
													"name": "Tableau Desktop",
													"description": "Powerful tool for data analytics and visualisation",
													"url": "http://www.tableausoftware.com/products/desktop"
												},
												{
													"name": "Tableau Public",
													"description": "Free version of Tableau Desktop where charts are public",
													"url": "http://www.tableausoftware.com/products/public",
													"free": true
												}
											]
										}
									]
								},
								{
									"name": "Coding",
									"description": "Code-based data visualisation creation",
									"free": true,
									"children": [
										{
											"name": "JavaScript",
											"description": "The language behind most (all?) browser-based data visualisations",
											"free": true,
											"children": [
												{
													"name": "Charting libraries",
													"description": "Off-the-shelf pre-designed charts. Easy to use but less flexible.",
													"free": true,
													"children": [
														{
															"name": "Google Charts",
															"description": "A good selection of charts including bar, line, scatter, geo, pie, donut, org etc.",
															"url": "https://developers.google.com/chart/",
															"free": true
														},
														{
															"name": "HighCharts",
															"description": "A well maintained commercial library of commonly used chart types",
															"url": "https://www.highcharts.com/"
														},
														{
															"name": "InfoVis",
															"description": "A lovely selection of charts including bar, pie, sunburst, icicle, network, trees etc.",
															"url": "https://philogb.github.io/jit/",
															"free": true
														},
														{
															"name": "Mapping",
															"description": "Libraries for visualising geographic data",
															"free": true,
															"children": [
																{
																	"name": "Kartograph",
																	"description": "Lovely vector based mapping library with good browser support",
																	"url": "http://kartograph.org/",
																	"free": true
																},
																{
																	"name": "Leaflet",
																	"description": "Tile-based mapping library",
																	"url": "http://leafletjs.com/",
																	"free": true
																}
															]
														},
														{
															"name": "MetricsGraphics.js",
															"description": "Beautiful line, scatter and histogram charts built on top of D3",
															"url": "http://metricsgraphicsjs.org/",
															"free": true
														},
														{
															"name": "NVD3",
															"description": "A general purpose charting library built on top of D3",
															"url": "http://nvd3.org/",
															"free": true
														},
														{
															"name": "Sigma",
															"description": "Library for visualising networks",
															"url": "http://sigmajs.org/",
															"free": true
														}
													]
												},
												{
													"name": "Custom coded",
													"description": "For maximum flexibility, custom coding is the way to go. These libraries will lend a hand.",
													"free": true,
													"children": [
														{
															"name": "D3",
															"description": "The jewel in the crown of web-based data visualisation. A library packed full of components for building any data visualisation you can imagine.",
															"url": "https://d3js.org/",
															"free": true
														},
														{
															"name": "Ractive",
															"description": "Relatively new, Ractive helps you make your HTML and SVG interactive",
															"url": "http://www.ractivejs.org/",
															"free": true
														},
														{
															"name": "Raphaël",
															"description": "A general purpose drawing library with good browser support",
															"url": "http://raphaeljs.com/",
															"free": true
														},
														{
															"name": "Snap.svg",
															"description": "A modern version of Raphaël that supports modern browsers",
															"url": "http://snapsvg.io/",
															"free": true
														},
														{
															"name": "Variance",
															"description": "A declarative, mark-up based data visualisation library",
															"url": "https://variancecharts.com/"
														},
														{
															"name": "Vega",
															"description": "A declarative language for specifying data visualistions",
															"url": "https://trifacta.github.io/vega/",
															"free": true
														}
													]
												}
											]
										},
										{
											"name": "Other",
											"description": "Non-JavaScript languages for producing web-based data visualisations",
											"free": true,
											"children": [
												{
													"name": "Python",
													"description": "Python's a very popular language in data science and is a pleasant language to learn and use",
													"free": true,
													"children": [
														{
															"name": "Bokeh",
															"description": "A powerful tool for producing interactive plots, dashboards and data applications",
															"url": "https://bokeh.pydata.org/",
															"free": true
														}
													]
												},
												{
													"name": "R",
													"description": "Very popular language for data science",
													"free": true,
													"children": [
														{
															"name": "Shiny",
															"description": "A platform for producing web applications using R",
															"url": "http://shiny.rstudio.com/",
															"free": true
														}
													]
												}
											]
										}
									]
								}
							]
						}

						var m = [20, 120, 20, 20],
							w = 1280 - m[1] - m[3],
							h = 800 - m[0] - m[2],
							i = 0,
							root;

						var tree = d3.layout.tree()
							.size([h, w]);

						var diagonal = d3.svg.diagonal()
							.projection(function(d) { return [d.y, d.x]; });

						var vis = d3.select("#body").append("svg:svg")
							.attr("width", w + m[1] + m[3])
							.attr("height", h + m[0] + m[2])
							.append("svg:g")
							.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

						root = json_data;
						root.x0 = h / 2;
						root.y0 = 0;

						function toggleAll(d) {
							if (d.children) {
								d.children.forEach(toggleAll);
								toggle(d);
							}
						}

						// Initialize the display to show a few nodes.
						// root.children.forEach(toggleAll);
						// toggle(root.children[1]);
						// toggle(root.children[1].children[2]);
						// toggle(root.children[9]);
						// toggle(root.children[9].children[0]);

						update(root);


						function update(source) {
							var duration = d3.event && d3.event.altKey ? 5000 : 500;

							// Compute the new tree layout.
							var nodes = tree.nodes(root).reverse();

							// Normalize for fixed-depth.
							nodes.forEach(function(d) { d.y = d.depth * 180; });

							// Update the nodes…
							var node = vis.selectAll("g.node")
								.data(nodes, function(d) { return d.id || (d.id = ++i); });

							// Enter any new nodes at the parent's previous position.
							var nodeEnter = node.enter().append("svg:g")
								.attr("class", "node")
								.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
								.on("click", function(d) { toggle(d); update(d); });

							nodeEnter.append("svg:circle")
								.attr("r", 1e-6)
								.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

							nodeEnter.append('a')
								.attr('xlink:href', function(d) {
									return d.url;
								})
								.append("svg:text")
								.attr("x", function(d) { return d.children || d._children ? -10 : 10; })
								.attr("dy", ".35em")
								.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
								.text(function(d) { return d.name; })
								.style('fill', function(d) {
									return d.free ? 'black' : '#999';
								})
								.style("fill-opacity", 1e-6);

							nodeEnter.append("svg:title")
								.text(function(d) {
									return d.description;
								});

							// Transition nodes to their new position.
							var nodeUpdate = node.transition()
								.duration(duration)
								.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

							nodeUpdate.select("circle")
								.attr("r", 6)
								.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

							nodeUpdate.select("text")
								.style("fill-opacity", 1);

							// Transition exiting nodes to the parent's new position.
							var nodeExit = node.exit().transition()
								.duration(duration)
								.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
								.remove();

							nodeExit.select("circle")
								.attr("r", 1e-6);

							nodeExit.select("text")
								.style("fill-opacity", 1e-6);

							// Update the links…
							var link = vis.selectAll("path.link")
								.data(tree.links(nodes), function(d) { return d.target.id; });

							// Enter any new links at the parent's previous position.
							link.enter().insert("svg:path", "g")
								.attr("class", "link")
								.attr("d", function(d) {
									var o = {x: source.x0, y: source.y0};
									return diagonal({source: o, target: o});
								})
								.transition()
								.duration(duration)
								.attr("d", diagonal);

							// Transition links to their new position.
							link.transition()
								.duration(duration)
								.attr("d", diagonal);

							// Transition exiting nodes to the parent's new position.
							link.exit().transition()
								.duration(duration)
								.attr("d", function(d) {
									var o = {x: source.x, y: source.y};
									return diagonal({source: o, target: o});
								})
								.remove();

							// Stash the old positions for transition.
							nodes.forEach(function(d) {
								d.x0 = d.x;
								d.y0 = d.y;
							});
						}

// Toggle children.
						function toggle(d) {
							if (d.children) {
								d._children = d.children;
								d.children = null;
							} else {
								d.children = d._children;
								d._children = null;
							}
						}
					};
					//d3_launch();


					let getData = function (file) {return  $http.get(file);};

					getData('friends_id_map.json').then(function(data) {
						console.log(data) ;
						$scope.users = data.data.friends;
						console.log($scope.users);

						$scope.users.forEach(function(u){
							$scope.user_cache[u.id] = {};
							$scope.user_cache[u.id].playlists = [];
							$scope.user_cache[u.id].tracks = [];
							$scope.user_cache[u.id].artists = [];
							$scope.user_cache[u.id].genres = [];
							$scope.user_cache[u.id].distinct_tracks_genres = [];
							$scope.user_cache[u.id].distinct_artists = [];
							$scope.user_cache[u.id].distinct_genres = [];
							$scope.genre_freq_map[u.id] = {};
							$scope.artist_freq_map[u.id] = {};

							$scope.user_cache_ctrl[u.id] = {}

							//selected
							$scope.user_cache_ctrl[u.id]['playlists'] = []
							$scope.user_cache_ctrl[u.id]['families'] = [];
							$scope.user_cache_ctrl[u.id]['genres'] = [];

							//todo: a special user called 'metro' since we don't allow for searching of more than one metro (like, per user)
							//at a time, but this is still a user control function

							$scope.user_cache_ctrl['metro'] = {eventFamilies:[]};

							all_genres.forEach(function(g){
								$scope.user_cache_ctrl[u.id][g] = false;
							});

							$scope.family_freq_map[u.id] = {};
							$scope.user_cache_ctrl[u.id]['family-event'] = {};
							$scope.user_cache_ctrl[u.id].show = {};
							$scope.user_cache_ctrl[u.id].show.playlists = true;

							$scope.user_cache_ctrl[u.id].show.user = true;
							$scope.user_cache_ctrl[u.id].show.playlists = true;
							$scope.user_cache_ctrl[u.id].show.artists = false;
							$scope.user_cache_ctrl[u.id].show.genres = true;
							$scope.user_cache_ctrl[u.id].show.families = true;



							globalFamilies.forEach(function(f){

								//todo: need to reorganize user_cache_ctrl
								$scope.user_cache_ctrl[u.id][f] = false;

								$scope.user_cache_ctrl[u.id]['family-event'][f] = true;

								$scope.family_freq_map[u.id][f] = 0;

							})

						})
						//$scope.$apply();
					});

					getData('metros.json').then(function(data) {
						console.log(data) ;
						$scope.metros = data.data.metros;
						console.log($scope.metros);
						//todo: move somewhere else
						$scope.global_metro = $scope.metros[0];
					});

					$scope.set_user_cache = function(){
						//todo:
						let filename = 'jake_usercache_v1.json'
						//let filename = 'dacandyman01_usercache_v1.json'
						getData(filename).then(function(data) {
							$scope.setIt({id:'1292167736'},data.data);
						});
					};

					$scope.setIt = function(user,cache){
						console.log("setIt...");

						console.log($scope.user_cache);
						$scope.user_cache[user.id] = cache;

						//recall process_playlists is the only process_ that sets user_cache
						//alasql("INSERT INTO playlists")
						$scope.process_playlists($scope.user_cache[user.id].playlists,user);

						$scope.user_cache[user.id].playlist_tracks.forEach(function(playTrackDuple){

							//alasql("INSERT INTO playlists_tracks, tracks, artists_tracks")
							$scope.process_tracks(playTrackDuple.tracks,playTrackDuple.playlist,user)
						});

						// alasql("INSERT INTO genres, artists_genres, artists")
						$scope.process_artists($scope.user_cache[user.id].artists_results,user).then(function(){

							//------------------------------------------------------------------------------------------
							//everything below is just a clone of the binding we would do at the end of get_all_tracks()

							let qry_distinct_artists = "select distinct artists.id as artist_id, artists.name as name"
								+ " from artists where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								+ " JOIN tracks t on t.id = pt.track_id"
								+ " JOIN artists_tracks at on at.track_id = t.id"
								+ " JOIN artists a on a.id = at.artist_id "
								// + " JOIN artists_genres ag on a.id = ag.artist_id"
								// + " JOIN genres g on g.id = ag.genre_id"
								+  " where owner = '" + user.id + "')";

							//console.log(qry_distinct_artists);
							//console.log(alasql("select * from artists"));
							$scope.user_cache[user.id]['artists'] =  alasql(qry_distinct_artists);

							//todo: order by similar genres? sounds hard
							let qry_distinct_genres = "select distinct genres.id as genre_id, genres.name as name, genres.family as family"
								+ " from genres where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								+ " JOIN tracks t on t.id = pt.track_id"
								+ " JOIN artists_tracks at on at.track_id = t.id"
								+ " JOIN artists a on a.id = at.artist_id "
								+ " JOIN artists_genres ag on a.id = ag.artist_id"
								+ " JOIN genres g on g.id = ag.genre_id"
								+  " where owner = '" + user.id + "')";

							//console.log(qry_distinct_genres);
							$scope.user_cache[user.id]['genres'] = alasql(qry_distinct_genres);

							let qry_distinct_tracks = "select distinct tracks.id as track_id, tracks.name as track_name"
								+ " from tracks where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								+ " JOIN tracks t on t.id = pt.track_id"
								+ " JOIN artists_tracks at on at.track_id = t.id"
								+ " JOIN artists a on a.id = at.artist_id "
								// + " JOIN artists_genres ag on a.id = ag.artist_id"
								// + " JOIN genres g on g.id = ag.genre_id"
								+  " where owner = '" + user.id + "')";

							//console.log(qry_distinct_tracks);
							$scope.user_cache[user.id].tracks =  alasql(qry_distinct_tracks);

							// console.log("setting genre_freq map...");
							// $scope.user_cache[user.id]['genres'].forEach(function(genre){
							// 	$scope.genres_frequency(genre,user);
							// });
							//
							// console.log("setting artist_freq map...");
							// $scope.user_cache[user.id]['artists'].forEach(function(artist){
							// 	$scope.artists_frequency(artist,user);
							// });

							console.log("setIt results",$scope.user_cache[user.id]);
							$scope.digestIt()

						})//process_artists
					};

					$scope.testPost = function(){
						let postData = function (addy,payload) {
							return  $http.post(addy,payload);
						};
						postData('localhost:8887/test',{test:"in"}).then(function(data) {
							console.log(data) ;
							//$scope.$apply();
						});
					};

					$scope.clearStore = function(){
						$scope.localStorage.clear();
					};

					$scope.digestIt = function(){
						try{$scope.$digest();}
						catch(e){}
					};

					//section: UI UTILITIES
					//===========================================================================================


					

					//todo: what is purpose of this again?
					$scope.shared = {};
					$scope.shared['genres'] = false;
					$scope.shared['artists']  = false;

					//section: provide stats, shortcut functions and sorting for genre-analysis


					//todo: still seems a little off

					/**
					 * display # of genres selected determined by families selected
					 *
					 * @method getSelectedGenres
					 * @param u
					 * @returns {number}
					 */
					$scope.getSelectedGenres = function(u){

						//console.log("getSelectedGenres");

						//console.log($scope.user_cache[u.id]['distinct_genres'])
						//console.log($scope.user_cache[u.id]['distinct_genres'])

						let genreCounted = [];
						//get all families selected
						$scope.user_cache_ctrl[u.id]['families'].forEach(function(f){

							//get all the genres in the family selected
							$scope.familyGenre_map[f].forEach(function(gInMap){

								// console.log(gInMap);
								// console.log($scope.user_cache[u.id]['distinct_genres'][0].name);

								//if the user has that genre and we didn't already / count it
								$scope.user_cache[u.id]['distinct_genres'].forEach(function(dg){
									if(dg.name === gInMap && genreCounted.indexOf(dg.name) === -1){
										//total++;
										genreCounted.push(dg.name)
									}
								})

							});
						});
						return genreCounted.length;
					};


					//select or deselect family in UI
					$scope.toggleFamily = function(u,f){
						let index = $scope.user_cache_ctrl[u.id]['families'].indexOf(f);
						if(index !== -1){
							$scope.user_cache_ctrl[u.id]['families'].splice(index,1)
						}
						else{
							$scope.user_cache_ctrl[u.id]['families'].push(f);
						}
					};


					//todo: needs updated: changed user_cache
					//not in use by UI currently
					$scope.genreEventMatches = function(g,global_metro){

						//metro_cache[global_metro.id]['artistsInfoMap']

						//for each genre from spotify
						//go thru every events artists's genres

						let g_artist_hit = 0;
						if($scope.metro_cache_performances[global_metro['id']]) {

							$scope.metro_cache_performances[global_metro['id']].forEach(function (p) {

								let spotId = $scope.user_cache.global.artistsSongkickSpotifyMap[p.artist.id];
								//console.log(spotId);
								let genres;
								$scope.user_cache.global.artistsInfoMap[spotId] ? genres = $scope.user_cache.global.artistsInfoMap[spotId].genres:genres = [];

								//we found genre in that artist
								if (genres.indexOf(g) !== -1) {
									g_artist_hit++;
								}
							});
							//console.log(g + " " + g_artist_hit);
							return g_artist_hit;
						}else{return null}
					};

					$scope.family_frequency_fetch = function(famName,user){
						//console.log("family_frequency_fetch", famName);

						//todo: this will become an issue over update cycles
						if($scope.user_cache[user.id]['distinct_tracks_genres'].length !== 0){

							//need to determine how many tracks belong to a family for a user.
							//select playlist->track->artists, and figure out how many times
							//the genres that belong to that family appear over all the tracks.
							//however a track belonging to an artist with multiple genres
							//will appear 2x, so filter for unique tracks

							let inGenres = $scope.familyGenre_map[famName];

							let tracks = $scope.alasql(user,'get','distinct_tracks_genres');
							//console.log(tracks);

							let famTrack_map = {};
							let used_tracks = [];

							let c = 0;
							tracks.forEach(function(atg) {

								//the track_genre is one of the genres the family describes
								let ing = inGenres.indexOf(atg.genre_name) !== -1;
								//if a track has two genres belonging to the same family, don't track it twice
								let nused = used_tracks.indexOf(atg.track_id) === -1;

								if (ing && nused) {
									c++;
									used_tracks.push(atg.track_id);
									// let fam = $scope.genreFam_map[atg.genre_name];
									// console.log(fam);
									//
									// fam.forEach(function(){
									// 	if(inGenres.indexOf(fam) !== -1){
									// 		c++
									// 	}
									// })

									// !famTrack_map[fam] ? famTrack_map[fam] = [] : {}
									// famTrack_map[fam].push(atg)
								}
							});

							//console.log(c);
							return c;

						}else{
							console.log("calc blocked");
						}
					};

					$scope.genre_frequency_fetch = function(genreTuple,user){
						//console.log("genre_frequency_fetch", genreTuple);

						//trying to select unique playlist->track->artists, and figure out how many times
						//a genre appears over all the tracks that belong to a user

						let tracks = $scope.alasql(user,'get','distinct_tracks_genres')
						let used_tracks = [];

						let c = 0;

						tracks.forEach(function(trackGenre){
							let eq = trackGenre.genre_id === genreTuple.genre_id
							let nused = used_tracks.indexOf(trackGenre) === -1;
							if(eq && nused) {
								used_tracks.push(trackGenre);
								c++
							}
						});

						//return c;
						return used_tracks;

						//todo: just genres and artists, don't care about track frequency

						// let genreArtist_map = {};
						// tracks.forEach(function(artTrackGenre){
						// 	if(!genreArtist_map[artTrackGenre.genre_name]){genreArtist_map[artTrackGenre.genre_name] = []}
						// 	genreArtist_map[artTrackGenre.genre_name].push(artTrackGenre)
						// });
						//return tracks.length

					};


					//section: provide stats, shortcut functions and sorting for event display


					//todo: are these the same thing?

					// UI reaction to family selection for filtering later
					//is a family selected for this user?
					$scope.familySelected = function(u,f){
						return $scope.user_cache_ctrl[u.id]['families'].indexOf(f) !== -1;
						// let ret = $scope.user_cache_ctrl[u.id]['families'].indexOf(f) !== -1;
						// console.log("familySelected",ret);
						// return ret
					};

					// UI reaction to family selection
					//is a family selected?
					$scope.inEventFam = function(name){
						if($scope.user_cache_ctrl['metro']){

							let efams = $scope.user_cache_ctrl['metro']['eventFamilies'];
							let index = efams.indexOf(name);
							if(index === -1){	return false;}
							else{return true;}

						}else{return true;}
					};

					//toggle selection of eventFamilies
					$scope.toggleEventFamily = function(name){
						//console.log("toggleEventFamily");

						let efams = $scope.user_cache_ctrl['metro']['eventFamilies'];
						let index = efams.indexOf(name);
						if(index === -1){	efams.push(name)}
						else{efams.splice(index,1);}

						//console.log(efams);
					};


					//I guess this isn't the slick way of doing this, but without exposing
					//literally a flattened version of every single data element I have, don't
					//know how else I would accomplish a query like this.

					//I'm assuming its because, from the page's perspective, its a complete mystery why
					//I'm allowing or disallowing items. for instace, the ability to just completely ignore the filter
					//with a top level condition here:

					//don't activate the filter below
					$scope.noEventFamily = true;

					//custom filter that using getPerfs for every event to determine
					//whether or not the event's performances are a good match
					//for the eventFamilies we've selected already
					$scope.eventFamily = function(item){
						let perfs = $scope.getPerfs(item)
						let fams = $scope.user_cache_ctrl['metro']['eventFamilies'];

						// console.log("$eventFamily",item);
						// console.log(perfs);
						// console.log($scope.global_metro);
						// console.log($scope.metro_cache[$scope.global_metro.id]);
						// console.log(fams);
						// console.log($scope.genreFam_map);
						let ret = false;
						if(!$scope.noEventFamily){
							for(var x = 0; x < perfs.length; x++){

								let q_artistSongkick_id = "select artist_id from artist_artistSongkick where  artistSongkick_id= " + perfs[x].artistSongkick_id + "";

								//todo: WHOOA how can we have a performance's artistSongkick_id that hasn't been registered?
								//nvm, thats what unresolved_artists is for...

								//console.log(q_artistSongkick_id);
								let q1 = alasql(q_artistSongkick_id);
								let genres = [];

								if(!q1[0]){
									console.warn("couldn't find artist_id for this (hopefully, unresolved) performance artist", perfs[x])
									//genres = [];
								}
								else{
									let qry2 = "select distinct g.id, g.name " +
										" from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id" +
										" where a.id = '"  + q1[0].artist_id + "'";
									genres = alasql(qry2);
									//console.log("$genres",genres);
								}

								if(genres.length > 0){
									genres.forEach(function(g){
										//console.log(g);

										//todo: just using first 'primary' family for genre
										let genFams = $scope.genreFam_map[g.name];
										if(genFams){
											//console.log(genFams[0]);
											if(fams.indexOf(genFams[0]) !== -1){
												ret = true;
												// console.log("$",ret);
											}
										}
									});
								}//genres >0
								else{ret = false;break;}
							}
						}else{ret = true;}
						// console.log("$$",ret);
						return ret;
					};//eventFamily


					//from genre-analysis

					//todo: not in use by UI

					$scope.filterGenre = "";
					$scope.set_filterGenre = function(g){
						$scope.filterGenre = g;
						$scope.digestIt();
					};

					//from artist-analysis

					//called as model in ng-repeat to get perfs for any event
					//also used by eventFamily custom filter to determine
					//event's performances viabilty with selected families

					$scope.getPerfs = function(e){

						let output = [];
						//console.log("getPerfs",e);


						//todo: WTF am I trying to accomplish here?
						//better than my old getPerfs filter thing I guess...

						let e_p = alasql("select * from events_performances ep where ep.event_id = " + e.id);
						$scope.metro_cache[e.metro_id]['performances'].forEach(function(p){
							e_p.forEach(function(ep){
								if(p.id === ep.performance_id){
									output.push(p);
								}
							})
						});

						return output;
					};

					//called as model in ng-repeat to get genres for any performance

					//todo: appears as though I could have just repeated over the genres lookup,
					//and provided a filter that took the performance as an argument?

					$scope.getGenres = function(p){

						//console.log("$getGenres",p);
						let output = [];

						let print = p.artistSongkick_id === 5380963;


						let qry1 = "select aas.artist_id,  aas.artistSongkick_id from artist_artistSongkick aas where aas.artistSongkick_id =" + p.artistSongkick_id;
						let qry1_res = alasql(qry1);

						 print ? console.log(qry1_res) : {}

						if(qry1_res[0]){

							//infdig example: output ends up being formed from a newly generated set of data every time
							// let bigList=  "select * from artists_genres ag JOIN genres g on ag.genre_id = g.id";
							// $scope.metro_cache[$scope.global_metro.id].artist_genres =  alasql(bigList);

							//no infdig: output is always a subset of data that we've precalculated
							//but obv this means we need to gurantee everytime we run this, we've updated this table
							//see: $biglist
							// $scope.metro_cache[$scope.global_metro.id].artist_genres.forEach(function (ag) {
							// 	if(ag.artist_id === qry1_res[0].artist_id){
							// 		output.push(ag);
							// 	}
							// });

							//solution without having to pre-determine artist_genres
							//what do we care about returning? just genre objects.
							//i'm okay with having a listing of genres predetermined
							//but not this relationship datamap

							let bigList=  "select * from artists_genres ag JOIN genres g on ag.genre_id = g.id";
							let artist_genres_OT = alasql(bigList);

							print ? console.log(artist_genres_OT) : {}
							let all_genres = $scope.alasql(false,"get","distinct_genres_all")
							print ?  console.log(all_genres) : {};


							let names = [];
							all_genres.forEach(function(g){
								artist_genres_OT.forEach(function (ag) {
									// console.log(qry1_res[0].artist_id);
									// console.log(ag);
									// console.log(gstr);
									if(ag.artist_id === qry1_res[0].artist_id){
										// print ? console.log("here") : {}
										if(ag.name === g.name){

										//	output.push(g);

											print ? console.log("$",g.name) : {}
											if(names.indexOf(g.name) === -1){
												output.push(g);
												names.push(g.name)
											}
										}
									}
								});
							});
						}

						print? console.log(output):{};
						return output;
					};


					//assisting with multiselects
					//todo: need to figure out where these are setup

					$scope.lookup = {};
					$scope.lookup['genres'] = {};
					$scope.lookup['playlists'] = {};

					$scope.playlistLookup = function(id){
						return $scope.lookup['playlists'][id]
					}

					$scope.genreLookup = function(genre_id){
						return $scope.lookup['genres'][genre_id];
					};

					//listings

					$scope.listing = {};
					$scope.listing['genres'] = [];

					//section: SONGKICK EVENTS
					//===========================================================================================

					//todo: something with this
					$scope.unresolved_artists = [];

					$scope.get_metro_events = function(metro){

						// console.log("get_metro_events hook",metro);
						// postData('localhost:8888/get_metro_events',
						// 	{req})
						// 	.then(function(data) {
						// 		console.log("get_metro_events returns:",data);
						// 		//$scope.$apply();
						// 	}).catch(function(err){
						// 	console.error(err)
						// })
						//test
						var req = {};
						req.type = "POST";
						req.url_postfix = "get_metro_events";

						req.body = {
							metro:metro,
							dateFilter:$scope.dateFilter,
							// raw_filename:$scope.raw_filename,
							// areaDatesArtists_filename:$scope.areaDatesArtists_filename
							raw_filename:$scope.raw_filename || "raw_" + metro.displayName +"_" + $scope.dateFilter.start + "-" + $scope.dateFilter.end + ".json",
							areaDatesArtists_filename:$scope.areaDatesArtists_filename || "areaDatesArtists_" + metro.displayName +"_" + $scope.dateFilter.start + "-" + $scope.dateFilter.end + ".json"
						};

						$http.post(url_local + req.url_postfix,req.body).then(function(res){
							// make_request_local(req).then(function(events){
							let events = res.data;
							console.log("get_metro_events results",JSON.parse(JSON.stringify(events)));
							//console.log("$user_cache",user_cache);

							// let events = [];
							// metroResults.forEach(function(set){
							// 	events = events.concat(set.events);
							// });

							let artist_names = [];
							let artist_name_map = {};
							// user_cache['global'].artists.full.forEach(function(art){
							// 	artist_names.push(art.name);
							// 	artist_name_map[art.name] = art;
							// });

							console.log("create fuzzyset",artist_name_map);
							var fm = new FuzzyMatching(artist_names);

							let artist_search_payload = [];

							let pushedIds = [];

							events.forEach(function(event){

								//do performances first

								let e_p = {};
								let tuple = {};

								event.performance.forEach(function(perf){
									// console.log(perf);

									e_p = {};
									e_p.event_id = event.id;
									e_p.performance_id = perf.id;

									alasql("INSERT INTO events_performances VALUES ( " + vlister(e_p)  + " )");

									// !$scope.metro_cache_performances[metroResults[0]['id']] ? $scope.metro_cache_performances[metroResults[0]['id']] = [] :{};
									// $scope.metro_cache_performances[metroResults[0]['id']].push(p);

									//todo: make this check my local database for match info first
									let match = fm.get(perf.displayName);
									//console.log("$match",match.value + " =? " + p.displayName);

									//todo: what is appropriate distance here?
									if(match.distance >= .8){
										perf.artist_match = match.value;
										perf.artist = artist_name_map[match.value]
									}
									else{
										//we will process these and update our table in a sec
										if(pushedIds.indexOf(perf.artist.id) === -1){
											tuple = {};
											tuple.displayName = perf.artist.displayName
											tuple.artistSongkick_id = perf.artist.id;
											artist_search_payload.push(tuple);
											pushedIds.push(perf.artist.id)
										}

									}
									perf.artistSongkick_id = perf.artist.id;
									reduce(performanceDef,perf);

									//sanitize
									let varchar_keys = ["displayName"];
									varchar_keys.forEach(function(key) {	perf[key] = perf[key].replace(/'/g, "''");});

									alasql("INSERT INTO performances VALUES ( " + vlister(perf)  + " )");

								}); //each performance

								//events

								//special reduce
								event.location ? event.location = event.location.city :  event.location = null;
								event.datetime = event.start.datetime;
								event.date =  event.start.date;
								event.venue =  event.venue.displayName;

								//sanitize
								let varchar_keys = ["displayName","venue"];
								varchar_keys.forEach(function(key) {	event[key] = event[key].replace(/'/g, "''");});

								//console.log("1",JSON.parse(JSON.stringify(event)));
								reduce(eventDef,event);
								//console.log("2",JSON.parse(JSON.stringify(event)));

								alasql("INSERT INTO events VALUES ( " + vlister(event)  + " )");
								//console.log(alasql("select * from events"));

							}); //res.data

							let req = {};
							req.url_postfix = "search_artists";
							req.type = "POST";
							req.body = {};
							req.body.perfTuples = artist_search_payload;
							let params = getHashParams();
							req.body.token = params.access_token;

							//TODO: this doesn't seem right...too many repeats, seems to obviously be missing some
							console.log("artist_search_payload for Spotify submission...",JSON.parse(JSON.stringify(artist_search_payload)));

							$http.post(url_local + req.url_postfix,req.body).then(function(res){
								console.log("artist_search_payload results:",JSON.parse(JSON.stringify(res.data)));

								let artist_artistSongkick = {};
								let payloads = [];
								let payload = {artists:[]};
								let genId = 0;
								let genSpotifyIdBase = "xxx"

								res.data.forEach(function(tuple){

									//so we couldn't find the artist in spotify, but we still need an artist record for them
									//so create a shell of an aritst object to be submitted to process_artists
									//that looks the same as the Spotify artists, but with most fields null and a made up id

									if(tuple.error){
										tuple.artist = {};
										tuple.artist.id = genSpotifyIdBase + genId++;
										tuple.artist.name = tuple.artistName;
										tuple.artist.uri = null;
										tuple.artist.popularity = null;
										tuple.artist.genres = [];
										//tuple.artistSongkick_id = tuple.artistSongkick_id;

										$scope.unresolved_artists.push(tuple);

									}

									//todo: somethings a little fucked here, don't know what though
									//tuple.artist.name === "Consider the Source" ? console.log(tuple):{};

									artist_artistSongkick.artist_id = tuple.artist.id;
									artist_artistSongkick.artistSongkick_id = tuple.artistSongkick_id;
									alasql("INSERT INTO artist_artistSongkick VALUES ( " + vlister(artist_artistSongkick)  + " )");

									payload.artists.push(tuple.artist)

								});

								//process_artists has weird params
								payloads.push(payload);

								console.log("Spotify unresolved artists, still submitted to process_artists",$scope.unresolved_artists);

								$scope.process_artists(payloads).then(function(){

									//todo: modify for multiple metro calls

									// $scope.metro_cache[events[0].metro_id] = events;
									// $scope.metro_cache[events[0].metro_id] = alasql("select * from events;");

									console.log("metro_cache",$scope.metro_cache);
									// console.log('events:',alasql("select * from events;"));
									// console.log('performances:',alasql("select * from performances;"));
									// console.log('events_performances:',alasql("select * from events_performances;"));
									// console.log('artist_artistSongkick:',alasql("select * from artist_artistSongkick;"));

									// let qry = "select p.displayName as perf_displayName, " +
									// 	"from events e JOIN events_performances ep on e.id = ep.event_id JOIN performances p on p.id = ep.performance_id";
									//
									// $scope.metro_cache[events[0].metro_id] = alasql(qry);

									//todo: (process_artists)
									!$scope.metro_cache[events[0].metro_id] ? $scope.metro_cache[events[0].metro_id] = {} : {};

									$scope.metro_cache[events[0].metro_id].events = alasql("select * from events;")
									// $scope.metro_cache[events[0].metro_id].performances = alasql("select * from performances;")

									// p.artistSongkick_id
									// p.billing
									// p.billingIndex
									// p.displayName
									// p.id

									let qperf = "select * from performances;"

									$scope.metro_cache[events[0].metro_id].performances = alasql(qperf)

									console.log($scope.metro_cache[events[0].metro_id]);

									$scope.alasql(false,"set","distinct_genres_all")

									$scope.digestIt();
								})

							});//search_artists post

						})//get_metro_events post
					};

					var write_schedule = function(results){
						results.forEach(function(result){
							result.events.forEach(function(event){

								//todo: handle festivals differently (event.type = 'Festival')
								//performance is an array of artists (headliner, support, etc)
								var performance = {};

								var date = new Date(event.start.date);
								var m = date.getUTCMonth() + 1;
								var d = date.getUTCDate();
								var y  = date.getFullYear();
								var day = date.getUTCDay();

								var newDate = weekday[day] + ", " + m + "-" + d + "-" + y
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

					//section:  SPOTIFY RECORDS
					//===========================================================================================

					$scope.playlist_add_artist_tracks = function(){
						let req = {};
						req.url_postfix = "playlist_add_artist_tracks";
						// req.type = "POST";
						req.body = {};

						//todo: parameterize playlist, artist
						req.body.playlist = {id:"3xTsy6eE5I1R8jC1nUdHjV"};
						req.body.artist = {id:"450o9jw6AtiQlQkHCdH6Ru"};

						let params = getHashParams();
						req.body.token = params.access_token;

						$http.post(url_local + req.url_postfix,req.body).then(function(res){

							console.log("playlist_create",res);

						});
					};

					$scope.playlist_add_tracks = function(){
						let req = {};
						req.url_postfix = "playlist_add_tracks";
						// req.type = "POST";
						req.body = {};

						req.body.playlist = {id:"3xTsy6eE5I1R8jC1nUdHjV"};
						req.body.tracks = [
							{id:"6QUngYwZ65et2ye7Bj85EK"},
							{id:"2t5GyUfFoZg3E8ak3i7dVP"},
							{id:"6SgQIoLn8kpu8J4wfwGWy8"}
						];

						let params = getHashParams();
						req.body.token = params.access_token;

						$http.post(url_local + req.url_postfix,req.body).then(function(res){

							console.log("playlist_create",res);

						});
					};

					$scope.playlist_create = function(){
						let req = {};
						req.url_postfix = "playlist_create";
						// req.type = "POST";
						req.body = {};

						req.body.user = {id:"dacandyman01"};
						//todo: can't create on anyone's account but my own (makes sense)
						// req.body.user = $scope.global_user;


						let params = getHashParams();
						req.body.token = params.access_token;

						$http.post(url_local + req.url_postfix,req.body).then(function(res){

							console.log("playlist_create",res);

						});
					};

					$scope.artist_topTracks = function(){
						let req = {};
						req.url_postfix = "artist_topTracks";
						// req.type = "POST";
						req.body = {};
						req.body.artist = {id:"450o9jw6AtiQlQkHCdH6Ru"};
						let params = getHashParams();
						req.body.token = params.access_token;

						$http.post(url_local + req.url_postfix,req.body).then(function(res){
							console.log("artist_topTracks",res);

						});
					};


					//todo:refactor to spotify service in backend

					/**
					 * load my playlists into cache.playlists.simple, cache.playlists.full, and
					 * mapped by user into cache.playlists.userMap
					 * @function user_playlists
					 **/
					$scope.get_user_playlists =function(user){
						var url1 = "/playlists";
						var url_users = "https://api.spotify.com/v1/users";

						//var url_example = "https://api.spotify.com/v1/users/dacandyman01/playlists?offset=0&limit=50"
						//var test_console = "https://beta.developer.spotify.com/console/get-playlists/?user_id=wizzler&limit=&offset=";

						let cache = {};
						cache.dummy  = [];
						var url_object = {};
						url_object.url =  url_users + "/" + user.id + url1;
						url_object.offset = 0;
						url_object.limit = 50;
						url_object.fields = "";


						make_request(url_object,cache.dummy)
							.then(function(data){
								//data = cache.playlists.full

								console.log("user_playlists finished with records length:" ,data.length);
								console.log(url_object.url,JSON.parse(JSON.stringify(data)));

								//little weird var pass here
								$scope.process_playlists(data,user);

								//todo: move this auto select somewher else

								// let selected = [];
								// $scope.user_cache[user.id]['playlists'].forEach(function(p){
								// 	p._cmo_checked = true;
								// 	selected.push(p)
								// });
								// $scope.user_cache[user.id].selected = selected;
								// console.log(selected);
								$scope.digestIt();

							})

					};//user_playlists



					$scope.alasql = function(user,verb,queryName){

						//console.log("$alasql",user,verb,queryName);

						const qry_distinct_artists = "select distinct artists.id as artist_id, artists.name as name"
							+ " from artists where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							+ " JOIN tracks t on t.id = pt.track_id"
							+ " JOIN artists_tracks at on at.track_id = t.id"
							+ " JOIN artists a on a.id = at.artist_id "
							// + " JOIN artists_genres ag on a.id = ag.artist_id"
							// + " JOIN genres g on g.id = ag.genre_id"
							+  " where owner = '" + user.id + "')";

						const qry_distinct_genres = "select distinct genres.id as genre_id, genres.name as name, genres.family as family"
							+ " from genres where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							+ " JOIN tracks t on t.id = pt.track_id"
							+ " JOIN artists_tracks at on at.track_id = t.id"
							+ " JOIN artists a on a.id = at.artist_id "
							+ " JOIN artists_genres ag on a.id = ag.artist_id"
							+ " JOIN genres g on g.id = ag.genre_id"
							+  " where owner = '" + user.id + "')";

						const qry_distinct_genres_all = "select distinct genres.id as genre_id, genres.name as name, genres.family as family"
							+ " from genres";

						// const qry_distinct_tracks = "select a.id as artist_id, a.name as name, t.name as track_name, t.id as track_id, g.name as genre_name, g.id as genre_id, g.family as family"
						// 	+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
						// 	+ " JOIN tracks t on t.id = pt.track_id"
						// 	+ " JOIN artists_tracks at on at.track_id = t.id"
						// 	+ " JOIN artists a on a.id = at.artist_id "
						// 	+ " JOIN artists_genres ag on a.id = ag.artist_id"
						// 	+ " JOIN genres g on g.id = ag.genre_id"
						// 	+  " where owner = '" + user.id + "'";
						// // +  " where owner = '" + user.id + "' and g.id = " + genreTuple.genre_id;



						// let sub_query = "( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
						// //+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
						// + " JOIN tracks t on t.id = pt.track_id"
						// + " JOIN artists_tracks at on at.track_id = t.id"
						// + " JOIN artists a on a.id = at.artist_id "
						// + " JOIN artists_genres ag on a.id = ag.artist_id"
						// + " JOIN genres g on g.id = ag.genre_id"
						// +  " where owner = '" + user.id + "')";


						//todo: I might still be confused about exactly what distinct does here
						const qry_distinct_tracks_genres = "select distinct t.id as track_id, t.name as track_name, g.id as genre_id,g.name as genre_name, a.name as artist_name, a.id  as artist_id"
						+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
						+ " JOIN tracks t on t.id = pt.track_id"
						+ " JOIN artists_tracks at on at.track_id = t.id"
						+ " JOIN artists a on a.id = at.artist_id "
						+ " JOIN artists_genres ag on a.id = ag.artist_id"
						+ " JOIN genres g on g.id = ag.genre_id"
						+  " where owner = '" + user.id + "'";
						//+ " where " + sub_query;

						let queryMap = {
							//todo:
							playlists:"",

							distinct_artists:qry_distinct_artists,
							distinct_tracks_genres:qry_distinct_tracks_genres,
							distinct_genres:qry_distinct_genres,
							distinct_genres_all:qry_distinct_genres_all
						};

						//todo: testing non-user listing storage here

						if(verb === 'get'){
							if(user){
								return $scope.user_cache[user.id][queryName];
							}else{
								return $scope.listing.genres;
							}

						}
						else if(verb === 'set'){
							if(user){
								$scope.user_cache[user.id][queryName] = alasql(queryMap[queryName])
								//$scope.user_cache[user.id][queryName] = alasql(queryName);
								console.log(queryName + " was set to: ",$scope.user_cache[user.id][queryName]);
							}else{
								$scope.listing.genres = alasql(queryMap[queryName])
							}

						}
					};

					/** run thru the cache.playlists, calling playlist_tracks for each
					 *  at the end, as a result of playlist_track's work, we have
					 *  a cache of interesting data which we preserve in a user cache and clear it.
					 *
					 *
					 * @function get_all_tracks
					 **/
					$scope.get_all_tracks = function(user,playlists){

						console.log("getting tracks for '" + user.display_name + "'s  playlists..." );

						$scope.playlist_tracks(user,playlists).then(function(results) {

							//todo: desc
							//we've already done all the processing in the calls to playlist_tracks
							//so we just use this section to do some reporting and ....


							//results will be the last result of the $scope.playlist_tracks() promise chain
							//i.e. its not super useful. instead we've been maintaining a map of every playlist's track
							//which is updated every time a playlist request is exhausted

							console.log("============================================================");
							console.log("get_all_tracks promise chain finished");

							// let qry_distinct_artists = "select distinct artists.id as artist_id, artists.name as name"
							// 	+ " from artists where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							// 	//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							// 	+ " JOIN tracks t on t.id = pt.track_id"
							// 	+ " JOIN artists_tracks at on at.track_id = t.id"
							// 	+ " JOIN artists a on a.id = at.artist_id "
							// 	// + " JOIN artists_genres ag on a.id = ag.artist_id"
							// 	// + " JOIN genres g on g.id = ag.genre_id"
							// 	+  " where owner = '" + user.id + "')";
							//
							// console.log(qry_distinct_artists);
							// console.log(alasql("select * from artists"));
							// $scope.user_cache[user.id]['artists'] =  alasql(qry_distinct_artists);
							// console.log("setting artist_freq map...");
							// $scope.user_cache[user.id]['artists'].forEach(function(artist){
							// 	$scope.artists_frequency(artist,user);
							// });

							$scope.alasql(user,'set','distinct_artists')

							// //todo: order by similar genres? sounds hard
							// let qry_distinct_genres = "select distinct genres.id as genre_id, genres.name as name, genres.family as family"
							// 	+ " from genres where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							// 	//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							// 	+ " JOIN tracks t on t.id = pt.track_id"
							// 	+ " JOIN artists_tracks at on at.track_id = t.id"
							// 	+ " JOIN artists a on a.id = at.artist_id "
							// 	+ " JOIN artists_genres ag on a.id = ag.artist_id"
							// 	+ " JOIN genres g on g.id = ag.genre_id"
							// 	+  " where owner = '" + user.id + "')";
							//
							// console.log(qry_distinct_genres);
							// $scope.user_cache[user.id]['genres'] = alasql(qry_distinct_genres);
							// console.log("setting genre_freq map...");
							//
							// $scope.user_cache[user.id]['genres'].forEach(function(genre){
							// 	$scope.genres_frequency(genre,user);
							// });

							$scope.alasql(user,'set','distinct_genres')

							//console.log(alasql("select * from genres"));
							// console.log("select distinct_genres for user_id = " + user.id + "",$scope.user_cache[user.id]['genres']);
							// console.log("select distinct_artists for user_id = " + user.id + "",$scope.user_cache[user.id]['artists']);


							//console.log("select * from tracks;", alasql("select * from tracks;"));
							// let qry_distinct_tracks = "select distinct tracks.id as track_id, tracks.name as track_name"
							// 	+ " from tracks where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							// 	//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							// 	+ " JOIN tracks t on t.id = pt.track_id"
							// 	+ " JOIN artists_tracks at on at.track_id = t.id"
							// 	+ " JOIN artists a on a.id = at.artist_id "
							// 	// + " JOIN artists_genres ag on a.id = ag.artist_id"
							// 	// + " JOIN genres g on g.id = ag.genre_id"
							// 	+  " where owner = '" + user.id + "')";
							//
							// console.log(qry_distinct_tracks);
							//
							// $scope.user_cache[user.id].tracks =  alasql(qry_distinct_tracks);
							// console.log($scope.user_cache[user.id].tracks);

							$scope.alasql(user,'set','distinct_tracks_genres');



							//console.log("select * from playlists_tracks;",alasql("select * from playlists_tracks;"));
							//console.log("select * from artists_tracks;",alasql("select * from artists_tracks;"));
							//console.log("select * from genres;",alasql("select * from genres;"));
							//console.log("select * from artists;",alasql("select * from artists;"));
							//console.log("select * from artists_genres;",alasql("select * from artists_genres;"));

							// let qry1 = "select a.id AS artist_id, a.name AS artist_name, g.id AS genre_id, g.name AS genre_name " +
							// 	"from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id";
							//console.log("join all artists,genres", alasql(qry1));

							// let qry2 = "select * from playlists where owner = '" + user.id + "' ";
							// !$scope.playlists[user.id] ? $scope.playlists[user.id] = [] : {};
							// $scope.playlists[user.id] = alasql(qry2);
							// console.log(qry2, $scope.playlists[user.id]);

							// let qry3 = "select * from artists a "
							// 	+ " JOIN artists_tracks at on at.track_id = a.id"
							// 	// + " JOIN playlists_tracks pt on pt.track_id = at.track_id"
							// 	// + " JOIN playlist p on pt.playlist_id = pt.track_id"
							// 	// + " JOIN tracks t on t.id = pt.track_id"
							// 	// + " JOIN artists a on a.id = at.artist_id "
							// 	// + " JOIN artists_genres ag on a.id = ag.artist_id"
							// 	// + " JOIN genres g on g.id = ag.genre_id"
							// 	//+  " where p.owner = '" + user.id + "' ";

							$scope.digestIt();

						})
							.catch(function(err){
								console.log("promiseTrack err: ",err);
							});
					};


					//this one prints off and binds right here b/c its a one-time call
					$scope.process_playlists = function(data,user){

						data.forEach(function(playlist){

							//for set_user_cache, playlist comes in pre-formatted
							!(typeof playlist.owner === "string") ? playlist.owner = playlist.owner.id: {};

							//sanitize
							reduce(playlistDef,playlist);
							let varchar_keys = ["name"];
							varchar_keys.forEach(function(key) {	playlist[key] = playlist[key].replace(/'/g, "''");});

							alasql("INSERT INTO playlists VALUES ( " + vlister(playlist)  + " )");

						});

						//let qry = "select * from playlists;";
						let qry = "select * from playlists where owner = '" + user.id + "';";
						$scope.user_cache[user.id]['playlists'] = alasql(qry);

						$scope.user_cache[user.id]['playlists'].forEach(function(p){
							$scope.lookup['playlists'][p.id] = p;
						});

						console.log(qry,$scope.user_cache[user.id]['playlists']);

						$scope.digestIt();

					};

					let inserted_artists = [];

					/**Process all the /playlists/{playlist_id}/tracks requests
					 * alasql("INSERT INTO playlists_tracks, tracks, artists_tracks")
					 *
					 * @function $scope.process_tracks
					 **/
					$scope.process_tracks = function(data,playlist){
						// console.log("process_tracks");
						// console.log(data);
						// console.log(playlist);

						let playlist_track = {};
						let trackIn = {};
						let artist_track = {};

						let artist_list = [];
						let skip = 0;

						data.forEach(function(track){
							playlist_track = {};
							playlist_track.playlist_id = playlist.id;
							playlist_track.track_id = track.track.id;
							alasql("INSERT INTO playlists_tracks VALUES ( " + vlister(playlist_track)  + " )");

							trackIn = {};
							trackIn.id = track.track.id;
							trackIn.name = track.track.name;
							let varchar_keys = ["name"];
							varchar_keys.forEach(function(key) {	trackIn[key] = trackIn[key].replace(/'/g, "''");});
							alasql("INSERT INTO tracks VALUES ( " + vlister(trackIn)  + " )");

							//todo: check for unique tracks?

							track.track.artists.forEach(function(artistSimple){
								artist_track = {};
								artist_track.artist_id = artistSimple.id;
								artist_track.track_id = track.track.id;
								alasql("INSERT INTO artists_tracks VALUES ( " + vlister(artist_track)  + " )");

								//todo: there just doesn't seem to be a way to get FULL not SIMPLIFIED artist objects
								//back from a playlist-tracks request. see 'track object (full) desc here:
								//https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/

								//save list for later
								if(artist_list.indexOf(artistSimple.id) !== -1){skip++;}
								else {artist_list.push(artistSimple.id)}
							});

						});

						// console.log("select * from playlists_tracks;",alasql("select * from playlists_tracks;"));
						// console.log("select * from tracks;",alasql("select * from tracks;"));
						// console.log("select * from artists_tracks;",alasql("select * from artists_tracks;"));


						//when I want to cache someones playlist-track data, print these out and capture from console
						// let save = {};
						// save.playlist = playlist;
						// save.tracks = data;
						// console.log("$$$",save);

						return artist_list;
					};


					//registering genres that I don't recognize in my master genreFam_map
					// into families by taking my best guess given the words in the genre

					//this does NOT handle modifying database entries
					//BECAUSE it actually returns families for a genre, if we can find it
					//then, some piece of code after u call this would use that info to
					//create a proper db entry for the genre

					$scope.registerGenre = function(genre){
						genre = JSON.parse(JSON.stringify(genre));
						//if(!$scope.genreFam_map[genre.name]){
						//console.log("$registerGenre",genre);
						let pat = /(\w+)/g;
						let words = genre.name.match(pat);
						//console.log(words);


						//todo: rules here could easily get out of hand

						//providing some ways to short-circuit a genre's family determination

						//when people say just indie or alternative, they usually mean rock
						//otherwise they specify



						let regIt = function(word,genre){
							$scope.genreFam_map[genre.name] = [word];
							$scope.familyGenre_map[word].push(genre.name);

							genre.family = $scope.genreFam_map[genre.name];

							//$scope.lookup['genres'][genre.id] = genre;
							//$scope.listing['genres'].push(genre);

							return $scope.genreFam_map[genre.name];
						};
						for(var x=0; x < words.length; x++){

							// if the first word of the genre is the name of a family, put it in there
							// ex: 'folk pop'

							if(globalFamilies.indexOf(words[x]) !== -1){
								return regIt(words[x],genre)
							}
						}

						//no obvious genre -> family links,
						//so maybe we just need help interpreting words from the genre

						let customMap = {
							'indie':"rock",
							'alternative':"rock",
							'worship':"world",
							'christian':"world",
							'metallic':"metal",
						};

						for (var key in customMap){
							if(words.indexOf(key) !== -1 ){
								words[0] = customMap[key];
								return regIt(words[0],genre)
							}
						}

						//example: deathcore, deathgrass
						if(genre.name.indexOf("death")!== -1 ){
							words[0] = "metal";
							return regIt(words[0],genre)
						}

						//we got thru all the words, and couldn't register the genre
						return null;
					};

					/**Process all the 50 artist promise payloads we submitted.
					 * alasql("INSERT INTO genres, artists_genres, artists")
					 *
					 * @function $scope.process_artists
					 **/

					let genreInd = 0;
					$scope.process_artists = function(results){

						return new Promise(function(done, fail) {

							console.log("$process_artists");
							console.log(JSON.parse(JSON.stringify(results)));

							//use this to print batches of resolved artists out to console
							//in order to use as set_user_cache data
							//console.log(JSON.stringify(results,null,4));

							let all_artists = [];
							results.forEach((r)=>{all_artists = all_artists.concat(r.artists)});

							console.log(all_artists.length);



							let unique_genre_artist_map = {};
							let no_genre_artists = [];

							//insert artists objects = either real spotify ones or
							//failed spotify resolved ones that we made up shell artist objects for
							//when either of those two types of artists have no genres, save them for later

							//create a map of unique genres and their artists to process in a sec

							all_artists.forEach(function(ar){

								//todo: null sometimes? hows that happen exactly..?
								if(ar){
									if(ar.genres.length > 0){
										ar.genres.forEach((g)=>{
											if(!unique_genre_artist_map[g]){
												unique_genre_artist_map[g] = {artists:[]}
											}
											if(unique_genre_artist_map[g].artists.indexOf(ar) === -1){
												unique_genre_artist_map[g].artists.push(ar);
											}
										});
									}
									else{
										//either spotify didn't have an genres info or we couldn't resolve in spotify,
										//hence a purposefully created shell 'artist' object with no genres
										no_genre_artists.push(ar);
									}

									//we only needs keys included in the def in the next loop
									//so destructing ar is OK

									reduce(artistDef, ar);
									let varchar_keys = ["name"];
									varchar_keys.forEach(function (key) {
										ar[key] = ar[key].replace(/'/g, "''");
									});
									alasql("INSERT INTO artists VALUES ( " + vlister(ar) + " )");

								}//non null artist
								else{
									console.log("error",ar);
								}
							});//all_artists

							let artist_genre = {};
							let genre = {};

							let no_family_genres_tuples = [];
							let registered_genres_tuples = [];

							//insert each genre, artist_genre and UNIQUE artist into their respective tables

							for(let key in unique_genre_artist_map){
								//console.log("here");
								genre = {};
								genreInd++
								genre.id = genreInd;
								genre.name = key;
								genre.family = [];
								if($scope.genreFam_map[genre.name] !== undefined){
									genre.family = $scope.genreFam_map[genre.name];
								}
								else{

									//we have genres for these artists, but it wasn't obvious what
									//family they belonged in because the genre wasn't registered in our dictionary

									let gat = $scope.registerGenre(genre);

									//if true, we successfully registered and can reference that registration to submit it to DB
									if(!gat){

										//we couldn't figure out what family to put this genre in for this artist
										no_family_genres_tuples.push({artist:unique_genre_artist_map[key].artists[0],genre:genre.name})

									}else{
										genre.family = $scope.genreFam_map[genre.name]
										registered_genres_tuples.push({artist:unique_genre_artist_map[key].artists[0],genre:genre.name})
									}
								}


								//todo: move to $scope.alasql()
								//$scope.lookup['genres'][genre.id] = key;
								//$scope.listing['genres'].push(genre);

								let varchar_keys = ["name"];
								varchar_keys.forEach(function(key) {	genre[key] = genre[key].replace(/'/g, "''");});

								alasql("INSERT INTO genres VALUES ( " + vlister(genre)  + " )");
								//console.log(alasql("select * from  genres"));

								unique_genre_artist_map[key].artists.forEach(function(ar){
									artist_genre = {};
									artist_genre.artist_id = ar.id;
									artist_genre.genre_id = genreInd;
									alasql("INSERT INTO artists_genres VALUES ( " + vlister(artist_genre)  + " )");

								});

							}// key in unique_genre_artist_map


							//all_artists who didn't has a spotify result of genres:[]
							//have been inserted into the artist table, but don't have they're
							//newly facted genres or artist-genre associations yet


							// let extQueries = [];

							console.log("Spotify artists whose genre we had to register",registered_genres_tuples);

							//todo: pretty sure nothing bad will happen if I do this?
							//not exactly sure how this effects calls from get_metro_events

							//only unique artists
							let exists =  {};
							let u_no_genre_artists = [];
							no_genre_artists.forEach(function(a,i){
								if(!(exists[a.name])){
									exists[a.name] = 1
									u_no_genre_artists.push(a);
								}
							});

							console.log("Artists without any genre info:",u_no_genre_artists);
							console.log("these will be submitted to getExternalInfos....");

							// no_genre_artists.forEach(function(ar){
							// 	 extQueries.push($scope.getExternalInfos(ar))
							// 	//extQueries.push($scope.getWikiPage(ar))
							// });

							// Promise.all(extQueries).then(function(tuples){

							$scope.getExternalInfos(no_genre_artists).then(function(tuples){
								console.log("$externalInfo results",tuples);
								let noGenreMatches = [];
								let noExternalInfoTuples = [];
								let registeredTuples = [];
								let noExternalInfoArtists = []

								//results.forEach(function(r){tuples.push(r.data)});

								let insertGenre_ArtistGenre = function(genreName, artist){

									let print = genreName === "christian relaxative";
									print ? console.log(genreName,artist):{}

									//we've already inserted these genres above, right?

									//let genres = alasql("select * from genres");
									//console.log(genres);

									let qry = "select id from genres where name = '" + genreName +  "'";
									//console.log(qry);
									let genre_id = alasql(qry);
									//console.log("$f",f);
									//console.log(genre_id);

									//if we couldn't find that genre, assign new artist_genre a new ind and insert
									//that genre. otherwise, just create the new record in artist_genre with the ind we found
									artist_genre = {};
									artist_genre.artist_id = artist.id;

									if(genre_id.length ===0 ){

										// print ? console.log("here"):{}

										//todo: not an appropriate method to index genreInd

										genre = {};
										genreInd++;
										genre.id = genreInd;
										genre.name = genreName;
										genre.family = $scope.genreFam_map[genreName];
										alasql("INSERT INTO genres VALUES ( " + vlister(genre)  + " )");

										artist_genre.genre_id = genreInd;
										//console.log("$artist_genre",artist_genre);
										alasql("INSERT INTO artists_genres VALUES ( " + vlister(artist_genre)  + " )");

										//$scope.listing.genres.push(genre);

									}else{
										//print ? console.log("here2"):{}
										artist_genre.genre_id = genre_id[0].id;
										//console.log("$artist_genre",artist_genre);
										alasql("INSERT INTO artists_genres VALUES ( " + vlister(artist_genre)  + " )");
									}

								}//insertGenre_ArtistGenre

								tuples.forEach(function(t){
									if(!(t.genres.length === 0)){
										t.genres.forEach(function(gName){
											//f = "flamenco"g

											//out genreFam_map stores them in lowercase
											gName = gName.toLowerCase();


											//todo: this list could get pretty big
											//this is the first time we're going to try and see
											//if the genre exists in any family

											gName === 'hip-hop' ? gName = 'hip hop':{};

											//a fact that came back matches a genre we have
											if($scope.genreFam_map[gName]){

												insertGenre_ArtistGenre(gName,t.artist)
												registeredTuples.push({tuple:t,genre:gName})
											}
											//we need to try and determine if we can use this 'genre' or not
											else{

												//todo: not an appropriate method to index genreInd
												genreInd++;

												genre = {name:gName,id:genreInd};
												let familyForGenre = $scope.registerGenre(genre);

												if(!familyForGenre){
													noGenreMatches.push({
														tuple:t,
														genre:gName
													})
												}else{
													//we were able to say that this genre belongs to a family
													//go ahead and register the genre and tuple
													insertGenre_ArtistGenre(gName,t.artist)

													registeredTuples.push({tuple:t,genre:gName})

												}
											}
										});
									}
									else{
										//external info didn't return anything interesting for this artist
										noExternalInfoTuples.push(t);
										noExternalInfoArtists.push(t.artist)
									}
								})

								//console.log("inserted_artists",inserted_artists.length);

								console.log("Spotify genre-artist without family info for this genre:",no_family_genres_tuples);

								console.log("ExternalInfo genre-artist which we were able to register tuples for",registeredTuples);
								console.log("ExternalInfo genre-artist couldn't use this genre b/c we couldn't determine a family",noGenreMatches);
								console.log("ExternalInfo genre-artist which we were NOT able to register tuples for",noExternalInfoTuples);
								console.log("artists from those tuples:",noExternalInfoArtists);

								//console.log("select * from artists_genres;",alasql("select * from artists_genres;"));

								// let qry = "select a.id AS artist_id, a.name AS artist_name, g.id AS genre_id, g.name AS genre_name " +
								// 	"from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id";
								// console.log("join artists with their genres",alasql(qry));

								done();

							});//promise.all

							//deprecated: trying to get out of the business of generating a map for every little thing
							let register_artistSongkick_genres = function(){
								console.log("register_artistSongkick_genres");

								let qry1 = "select artistSongkick_id ,artist_id from artist_artistSongkick";
								let artist_artistSongkick = alasql(qry1);

								//console.log("artist_artistSongkick",artist_artistSongkick);

								//todo:
								$scope.metro_cache[$scope.global_metro.id] = {};
								$scope.metro_cache[$scope.global_metro.id].artistSongkick_genres = {};
								$scope.metro_cache[$scope.global_metro.id].artistSongkick_artist = {};
								artist_artistSongkick.forEach(function(tuple){

									//broke this into smaller pieces
									// let qry2 = "select g.id AS genre_id, g.name AS genre_name " +
									// 	"from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id JOIN " +
									// 	"artist_artistSongkick aas on a.id = aas.artist_id where aas.artistSongkick_id = " + artistSongkick_id;

									let qry2 = "select distinct g.id, g.name " +
										" from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id" +
										" where a.id = '"  + tuple.artist_id + "'";

									let qry3 = "select * from artists a where id = '"  + tuple.artist_id + "'";

									//todo:
									$scope.metro_cache[$scope.global_metro.id].artistSongkick_genres[tuple.artistSongkick_id] = alasql(qry2);
									$scope.metro_cache[$scope.global_metro.id].artistSongkick_artist[tuple.artistSongkick_id] = alasql(qry3);

								})
							};
							//register_artistSongkick_genres();

						})//promise

					};//process_artists

					/**Get tracks for every playlist you throw at it {playlist_tracks_map}
					 * While processing the playlist track entries, it also fills out artistsInfoMap, artistsInfoMap_simple
					 * Called while iterating over playlists from get_all_tracks
					 *
					 * @function $scope.playlist_tracks
					 **/
					$scope.playlist_tracks = function(user,plays){
						return new Promise(function(done, fail) {
							console.log("playlist_tracks for: ",user.display_name);

							console.log(JSON.parse(JSON.stringify(plays,null,4)));
							let plays_checked = [];
							if(plays){
								// plays.forEach(function(p,i){
								// 	!p._cmo_checked ? plays.splice(i,1) : {};
								// })
								plays.forEach(function(p,i){
									p._cmo_checked ? plays_checked.push(p):{};
								});
								plays = plays_checked;
							}
							else{
								let qry = "select * from playlists where owner = '" + user.id + "' ";
								plays = alasql(qry);
								console.log(qry,plays);
							}

							//let promises = [];
							// plays.forEach(function(play){
							// 	let payload = {};
							// 	payload.url_postfix = "playlist_tracks";
							// 	payload.type = "POST";
							// 	payload.body = {};
							// 	payload.body.playlist = play;
							//
							// 	let params = getHashParams();
							// 	payload.body.token = params.access_token;
							//
							//
							// 	//console.log(payload);
							// 	promises.push($http.post(url_local + payload.url_postfix,payload.body));
							// });

							//fixme: #getArtist -  force short-query for playlists
							let p1 =
								{
									$$hashKey: "object:240",
									id: "6Y5pMXlTVVo1y0idN42O6g",
									name: "Alternative (party)",
									owner: "dacandyman01",
									public: "true",
									uri: "spotify:playlist:6Y5pMXlTVVo1y0idN42O6g",
									_cmo_checked: true}


							let p2 = {
								"id": "578eYeachMr2J9WUoXm5vp",
								"name": "REDDIT BEAUTIFUL",
								"owner": "dacandyman01",
								"public": "true",
								"uri": "spotify:playlist:578eYeachMr2J9WUoXm5vp",
								"$$hashKey": "object:106",
								"_cmo_checked": true
							}
							let p3 ={
								"id": "35tDrtRWRZzipC2yo4CZI4",
								"name": "Discover Archive",
								"owner": "dacandyman01",
								"public": "false",
								"uri": "spotify:playlist:35tDrtRWRZzipC2yo4CZI4",
								"$$hashKey": "object:192",
								"_cmo_checked": true
							}
							// plays = [p1];
							//plays = [p2];


							let payload = {};
							payload.url_postfix = "playlist_tracks";
							payload.type = "POST";
							payload.body = {};
							payload.body.playlists = plays;

							let params = getHashParams();
							payload.body.token = params.access_token;


							//console.log("sending request : " + payload.type + " :: " + payload.url_postfix);
							$http.post(url_local + payload.url_postfix,payload.body).then(function(res){
							// Promise.all(promises).then(function(res){

								console.log("$playlistTrackMap",res);

								let artist_list = [];
								res.data.forEach(function(payload){
									artist_list = artist_list.concat($scope.process_tracks(payload.tracks,{id:payload.playlist_id}))
								});

								let payloads = [];
								let custom_it = 0;
								let payload = [];
								//create payloads of 50 artists each, and push them as promises to resolve later

								artist_list.forEach(function(id,i){
									if(i === 0){payload.push(id)}
									else{
										if(!(i % 50 === 0)){payload.push(id)}
										else{
											payloads.push(payload);custom_it = 0;payload = [];
										}
									}
								});

								//leftover
								if(payload.length){payloads.push(payload)}


								//fixme: #getArtist -  force cached request
								// console.warn("imported locally:","franky's playlist artist payload");
								// payloads = get_artists_payload_franky;
								// console.log("$payloads",payloads);


								let promises = [];
								let payload_strs = [];
								payloads.forEach(function(payload){
									//form a comma seperated list of 50 artists ids
									let payload_str  = "";
									payload.forEach(function(id,i){
										payload_str = payload_str + id;
										i !== payload.length - 1 ? payload_str =  payload_str + "," :{}
									});
									payload_strs.push(payload_str);
								});


								let req_all = {};
								req_all.url_postfix = "get_artists";
								let params =  getHashParams();
								req_all.body = {};
								req_all.body.token = params.access_token;
								req_all.body.queries = payload_strs;

								//fixme:
								// let test = [];
								// test.push(req_all.body.queries[1])
								// req_all.body.queries = test;

								console.log("# of payload strings:",payload_strs.length);
								console.log("req_all.body.queries",req_all.body.queries);
								$http.post(url_local + req_all.url_postfix,req_all.body).then(function(results){
									console.log("$get_artists",results);
									//console.log(JSON.stringify(results.data,null,4));

									//fixme:
									//results = get_artists_results_franky;

									$scope.process_artists(results.data).then(function(){
										done();
									})

									// console.log("select * from genres;",alasql("select * from genres;"));
									// console.log("select * from artists;",alasql("select * from artists;"));
									// console.log("select * from artists_genres;",alasql("select * from artists_genres;"));

									// let qry = "select a.id AS artist_id, a.name AS artist_name, g.id AS genre_id, g.name AS genre_name " +
									// 	"from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id";
									// console.log("join artists with their genres",alasql(qry));


								})//promise all
							})//post then
						})};//playlist_tracks


					//section: searching utilities
					//===========================================================================================


					//this will go to the MS and first try to get more info from wiki, then a google search
					$scope.getExternalInfos = function(artists){
						return new Promise(function(done, fail) {
							var req = {};
							req.type = "POST";
							req.url_postfix = "getExternalInfos";
							let params = getHashParams();
							req.body = {
								artists:artists,
								token:params.access_token
							};


						    //attempting to parse out knowledge panels
							let parseGoogleHTML = function(html,artist){
								let doc = $(html);
								let str = "";

								//check each top level element (in case page redesign)
								for(var x = 0; x < 15; x++){
									let tbody = $(doc)[x];

									//todo: should always find genre but concerned about relying on next span
									let g = $(tbody).find("span:contains('Genre')").next()

									//this is the one we're looking for
									if(g[0]){
										str = g[0].innerText
									}
									// else{
									// 	g = $(tbody).find("span:contains('Genres')").next()
									// 	console.log("2");
									// 	if(g[0]){
									// 		str = g[0].innerText
									// 	}
									// }
								}
								//console.log(str);

								let genres = [];
								if(str) {
									if (str.indexOf(",") !== -1) {
										genres = str.split(",")
									} else if (str.indexOf("/") !== -1) {
										genres = str.split("/")
									}
									else{
										console.warn("had an issue splitting this string result",str);
									}
								}

								for(var x = 0; x < genres.length; x++){
									genres[x] = genres[x].trim();
								}

								//console.log("genres",genres);
								//console.log("parseGoogleHTML genres:",artist.name,genres);
								let tuple = {genres:genres,artist:artist}
								return tuple;
							};

							//get genres from a bandsintown page
							let parseBandHTML = function(html,artist){
								let doc = $(html);
								let str = "";

								//check each top level element (in case page redesign)
								for(var x = 0; x < doc.length; x++){
									let tbody = $(doc)[x];
									let g = $(tbody).find("div:contains('Genres: ')")

									if(g[0]){
										for(var y = 0; y < g.length; y++) {
											//console.log($(g[y]));
											//console.log($(g[y]).text());
											// console.log($(g[y])[0].innerText)
											let justG = $(g[y]).text() === "Genres: ";
											if (justG) {
												let n = $(g[y]).next();
												//console.log("n",n);
												str = $(n)[0].innerText
											}
										}
									}
									// else{
									// 	g = $(tbody).find("span:contains('Genres')").next()
									// 	console.log("2");
									// 	if(g[0]){
									// 		str = g[0].innerText
									// 	}
									// }
								}
								//console.log(str);

								let genres = [];
								if(str) {
									if (str.indexOf(",") !== -1) {
										genres = str.split(",")
									} else if (str.indexOf("/") !== -1) {
										genres = str.split("/")
									}
									else{
										console.warn("if this is >1 genre, there was an issue on split:",str);
										genres.push(str);
									}
								}

								for(var x = 0; x < genres.length; x++){
									genres[x] = genres[x].trim();
								}

								//console.log("genres",genres);
								console.log("parseBandHTML genres:",artist.name,genres);
								let tuple = {genres:genres,artist:artist}
								return tuple;
							};

							//todo: idk, one day just couldn't parse the whole page
							let parseGoogleHTML_deprecated = function(html){

								// console.log(res.data);
								let doc = $(html);
								//console.log(doc);
								let g = doc.find("span:contains('Genres')")
								let y = $(g).next()
								let z = y.text();

								//todo: catch
								let genres = z.split(",")

								for(var x = 0; x < genres.length; x++){
									genres[x] = genres[x].trim();
								}

								console.log("parseGoogleHTML2 genres:",genres);
								return genres
							};

							$http.post(url_local + req.url_postfix,req.body).then(function(res){

								console.log("$getExternalInfos finished:",res.data);
								let parsed_infos = [];

								res.data.forEach(function(info){

									//fixme:

									// if(info.artist.name === "Funk Worthy"){

										let tuple = {};
										tuple.artist = info.artist;

										//either we got genres from wiki
										// or we got an html page to parse from google

										if(info.genres){
											tuple.genres = info.genres;
										}
										else if(info.htmlBand){
											tuple = parseBandHTML(info.htmlBand,info.artist);
										}
										else{
											tuple = parseGoogleHTML(info.html,info.artist);
										}
										parsed_infos.push(tuple)

									// }



								});

								done(parsed_infos)

								//done(tuple);

							}).catch(function(err){
								console.log(err);
								fail(err)

							})
						})

					};

					//todo: depreciated
					$scope.getWikiPage = function(expression){
						return new Promise(function(done, fail) {
							var req = {};
							req.type = "POST";
							req.url_postfix = "getWikiPage";
							let params = getHashParams();
							req.body = {
								expression:expression,
								token:params.access_token
							}

							$http.post(url_local + req.url_postfix,req.body).then(function(res){

								console.log(res);
								done(res);

							}).catch(function(err){
								console.log(err);
								fail(err)

							})
						})

					};

					//todo: depreciated
					$scope.googleQuery = function(query){
						var req = {};
						req.type = "POST";
						req.url_postfix = "googleQuery";

						//todo: best way to force "music related" results
						req.body = {query:query + "music group"};

						$http.post(url_local + req.url_postfix,req.body).then(function(res){
							// console.log(res.data);
							let doc = $(res.data);
							//console.log(doc);
							let g = doc.find("span:contains('Genres')")
							let y = $(g).next()
							let z = y.text();
							let genres = z.split(",")

							for(var x = 0; x < genres.length; x++){
								genres[x] = genres[x].trim();
							}

							console.log(genres);

						})//$http
					};


				}); //controller


				//todo: depreciated

				exports.refreshToken = function() {
					console.log("getNewToken");

					//var userProfileSource = document.getElementById('user-profile-template').innerHTML,
					//    userProfileTemplate = Handlebars.compile(userProfileSource),
					//    userProfilePlaceholder = document.getElementById('user-profile');
					//
					//var oauthSource = document.getElementById('oauth-template').innerHTML,
					//    oauthTemplate = Handlebars.compile(oauthSource),
					//    oauthPlaceholder = document.getElementById('oauth');

					var params = getHashParams();

					var access_token = params.access_token,
						refresh_token = params.refresh_token,
						error = params.error;

					var newToken = function(){
						console.log("newToken");
						$.ajax({
							url: '/refresh_token',
							data: {
								'refresh_token': refresh_token
							}
						}).done(function(data) {
							console.log("newToken return: ",data.access_token);
							access_token = data.access_token;
							global_access_token = data.access_token;
							//oauthPlaceholder.innerHTML = oauthTemplate({
							//    access_token: access_token,
							//    refresh_token: refresh_token
							//});
						});
					}

					newToken();


				};

				var token = "BQBp8TJonAbRUf1MOQtpuLA4kI_j14M8QgySOrg85j6vDfsYRq7EVgFtoXIapfhfP5s0Q4hnmm3KDKagJQaMakm7_NOfVTldxGOngtHIngZSX_4nDSsRHlPg7dembiT_9XFrYXc_wc5uIy0b-u8iYHekcTalYL0hglCylUqMKY6Phz4Nn-WBnyEXx9F0YlMMhc2PAHmfGA"

				exports.forceToken = function() {
					console.log("forceToken");
					global_access_token = token;
				};

			})(window);

		} //!== undefined window



//var doSearchtest = function(word, callback) {
//
//    console.log("DOSEARCH");
//    console.log(word);
//    console.log(callback);
//}

//module.exports = doSearchtest

	},{"fuzzy-matching":2}],2:[function(require,module,exports){
		var fuzzySet = require('fuzzyset.js');
		var removeAccents = require('./lib/removeAccents');

		function FuzzyMatching(items) {
			var self = this;
			self.set = fuzzySet();
			self.itemMap = {};

			if (items) {
				items.forEach(function(item) {
					self.add(item);
				});
			}
		}

		FuzzyMatching.prototype.add = function(item) {
			if (typeof item !== 'string') {
				return false;
			}
			var itemWithoutAccents = removeAccents(item);
			if (this.itemMap[itemWithoutAccents]) {
				return false;
			}
			if (this.set.add(itemWithoutAccents) !== false) {
				this.itemMap[itemWithoutAccents] = item;
				return true;
			}
			return false;
		};

		FuzzyMatching.prototype.get = function(item, criteria) {
			var notFoundValue = {
				distance: 0,
				value: null
			};
			if (typeof item !== 'string') {
				return notFoundValue;
			}
			criteria = criteria || {};

			var res = this.set.get(removeAccents(item));
			if (!res) {
				return notFoundValue;
			}
			res = {
				distance: res[0][0],
				value: this.itemMap[res[0][1]]
			}

			// If it doesn't match requirements --> Consider not found
			if (criteria.min && res.distance < criteria.min) {
				return notFoundValue;
			} else if (criteria.maxChanges !== undefined && res.value.length && res.distance < 1 - (criteria.maxChanges / res.value.length)) {
				return notFoundValue;
			}
			return res;
		};

		module.exports = FuzzyMatching;
	},{"./lib/removeAccents":3,"fuzzyset.js":4}],3:[function(require,module,exports){
// From http://jsperf.com/diacritics/12

		module.exports = function removeDiacritics(str) {
			return str.replace(/[^\u0000-\u007E]/g, function(a) {
				return diacriticsMap[a] || a;
			});
		};

		var defaultDiacriticsRemovalap = [
			{
				'base': 'A',
				'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'
			}, {
				'base': 'AA',
				'letters': '\uA732'
			}, {
				'base': 'AE',
				'letters': '\u00C6\u01FC\u01E2'
			}, {
				'base': 'AO',
				'letters': '\uA734'
			}, {
				'base': 'AU',
				'letters': '\uA736'
			}, {
				'base': 'AV',
				'letters': '\uA738\uA73A'
			}, {
				'base': 'AY',
				'letters': '\uA73C'
			}, {
				'base': 'B',
				'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'
			}, {
				'base': 'C',
				'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'
			}, {
				'base': 'D',
				'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779'
			}, {
				'base': 'DZ',
				'letters': '\u01F1\u01C4'
			}, {
				'base': 'Dz',
				'letters': '\u01F2\u01C5'
			}, {
				'base': 'E',
				'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'
			}, {
				'base': 'F',
				'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'
			}, {
				'base': 'G',
				'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'
			}, {
				'base': 'H',
				'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'
			}, {
				'base': 'I',
				'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'
			}, {
				'base': 'J',
				'letters': '\u004A\u24BF\uFF2A\u0134\u0248'
			}, {
				'base': 'K',
				'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'
			}, {
				'base': 'L',
				'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'
			}, {
				'base': 'LJ',
				'letters': '\u01C7'
			}, {
				'base': 'Lj',
				'letters': '\u01C8'
			}, {
				'base': 'M',
				'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'
			}, {
				'base': 'N',
				'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'
			}, {
				'base': 'NJ',
				'letters': '\u01CA'
			}, {
				'base': 'Nj',
				'letters': '\u01CB'
			}, {
				'base': 'O',
				'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'
			}, {
				'base': 'OI',
				'letters': '\u01A2'
			}, {
				'base': 'OO',
				'letters': '\uA74E'
			}, {
				'base': 'OU',
				'letters': '\u0222'
			}, {
				'base': 'P',
				'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'
			}, {
				'base': 'Q',
				'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A'
			}, {
				'base': 'R',
				'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'
			}, {
				'base': 'S',
				'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'
			}, {
				'base': 'T',
				'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'
			}, {
				'base': 'TZ',
				'letters': '\uA728'
			}, {
				'base': 'U',
				'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'
			}, {
				'base': 'V',
				'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'
			}, {
				'base': 'VY',
				'letters': '\uA760'
			}, {
				'base': 'W',
				'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'
			}, {
				'base': 'X',
				'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C'
			}, {
				'base': 'Y',
				'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'
			}, {
				'base': 'Z',
				'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'
			}, {
				'base': 'a',
				'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'
			}, {
				'base': 'aa',
				'letters': '\uA733'
			}, {
				'base': 'ae',
				'letters': '\u00E6\u01FD\u01E3'
			}, {
				'base': 'ao',
				'letters': '\uA735'
			}, {
				'base': 'au',
				'letters': '\uA737'
			}, {
				'base': 'av',
				'letters': '\uA739\uA73B'
			}, {
				'base': 'ay',
				'letters': '\uA73D'
			}, {
				'base': 'b',
				'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'
			}, {
				'base': 'c',
				'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'
			}, {
				'base': 'd',
				'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'
			}, {
				'base': 'dz',
				'letters': '\u01F3\u01C6'
			}, {
				'base': 'e',
				'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'
			}, {
				'base': 'f',
				'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'
			}, {
				'base': 'g',
				'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'
			}, {
				'base': 'h',
				'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'
			}, {
				'base': 'hv',
				'letters': '\u0195'
			}, {
				'base': 'i',
				'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'
			}, {
				'base': 'j',
				'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249'
			}, {
				'base': 'k',
				'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'
			}, {
				'base': 'l',
				'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'
			}, {
				'base': 'lj',
				'letters': '\u01C9'
			}, {
				'base': 'm',
				'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'
			}, {
				'base': 'n',
				'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'
			}, {
				'base': 'nj',
				'letters': '\u01CC'
			}, {
				'base': 'o',
				'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'
			}, {
				'base': 'oi',
				'letters': '\u01A3'
			}, {
				'base': 'ou',
				'letters': '\u0223'
			}, {
				'base': 'oo',
				'letters': '\uA74F'
			}, {
				'base': 'p',
				'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'
			}, {
				'base': 'q',
				'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759'
			}, {
				'base': 'r',
				'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'
			}, {
				'base': 's',
				'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'
			}, {
				'base': 't',
				'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'
			}, {
				'base': 'tz',
				'letters': '\uA729'
			}, {
				'base': 'u',
				'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'
			}, {
				'base': 'v',
				'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'
			}, {
				'base': 'vy',
				'letters': '\uA761'
			}, {
				'base': 'w',
				'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'
			}, {
				'base': 'x',
				'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D'
			}, {
				'base': 'y',
				'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'
			}, {
				'base': 'z',
				'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'
			}];
		var diacriticsMap = {};
		for (var i = 0; i < defaultDiacriticsRemovalap.length; i++) {
			var letters = defaultDiacriticsRemovalap[i].letters.split("");
			for (var j = 0; j < letters.length; j++) {
				diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
			}
		}
	},{}],4:[function(require,module,exports){
		module.exports = require('./lib/fuzzyset.js');

	},{"./lib/fuzzyset.js":5}],5:[function(require,module,exports){
		(function() {

			var FuzzySet = function(arr, useLevenshtein, gramSizeLower, gramSizeUpper) {
				var fuzzyset = {
					version: '0.0.1'
				};

				// default options
				arr = arr || [];
				fuzzyset.gramSizeLower = gramSizeLower || 2;
				fuzzyset.gramSizeUpper = gramSizeUpper || 3;
				fuzzyset.useLevenshtein = useLevenshtein || true;

				// define all the object functions and attributes
				fuzzyset.exactSet = {}
				fuzzyset.matchDict = {};
				fuzzyset.items = {};

				// helper functions
				var levenshtein = function(str1, str2) {
					var current = [], prev, value;

					for (var i = 0; i <= str2.length; i++)
						for (var j = 0; j <= str1.length; j++) {
							if (i && j)
								if (str1.charAt(j - 1) === str2.charAt(i - 1))
									value = prev;
								else
									value = Math.min(current[j], current[j - 1], prev) + 1;
							else
								value = i + j;

							prev = current[j];
							current[j] = value;
						}

					return current.pop();
				};

				// return an edit distance from 0 to 1
				var _distance = function(str1, str2) {
					if (str1 == null && str2 == null) throw 'Trying to compare two null values'
					if (str1 == null || str2 == null) return 0;
					str1 = String(str1); str2 = String(str2);

					var distance = levenshtein(str1, str2);
					if (str1.length > str2.length) {
						return 1 - distance / str1.length;
					} else {
						return 1 - distance / str2.length;
					}
				};
				var _nonWordRe = /[^\w, ]+/;

				var _iterateGrams = function(value, gramSize) {
					gramSize = gramSize || 2;
					var simplified = '-' + value.toLowerCase().replace(_nonWordRe, '') + '-',
						lenDiff = gramSize - simplified.length,
						results = [];
					if (lenDiff > 0) {
						for (var i = 0; i < lenDiff; ++i) {
							value += '-';
						}
					}
					for (var i = 0; i < simplified.length - gramSize + 1; ++i) {
						results.push(simplified.slice(i, i + gramSize))
					}
					return results;
				};

				var _gramCounter = function(value, gramSize) {
					gramSize = gramSize || 2;
					var result = {},
						grams = _iterateGrams(value, gramSize),
						i = 0;
					for (i; i < grams.length; ++i) {
						if (grams[i] in result) {
							result[grams[i]] += 1;
						} else {
							result[grams[i]] = 1;
						}
					}
					return result;
				};

				// the main functions
				fuzzyset.get = function(value, defaultValue) {
					var result = this._get(value);
					if (!result && defaultValue) {
						return defaultValue;
					}
					return result;
				};

				fuzzyset._get = function(value) {
					var normalizedValue = this._normalizeStr(value),
						result = this.exactSet[normalizedValue];
					if (result) {
						return [[1, result]];
					}
					var results = [];
					for (var gramSize = this.gramSizeUpper; gramSize > this.gramSizeLower; --gramSize) {
						results = this.__get(value, gramSize);
						if (results) {
							return results;
						}
					}
					return null;
				};

				fuzzyset.__get = function(value, gramSize) {
					var normalizedValue = this._normalizeStr(value),
						matches = {},
						gramCounts = _gramCounter(normalizedValue, gramSize),
						items = this.items[gramSize],
						sumOfSquareGramCounts = 0,
						gram,
						gramCount,
						i,
						index,
						otherGramCount;

					for (gram in gramCounts) {
						gramCount = gramCounts[gram];
						sumOfSquareGramCounts += Math.pow(gramCount, 2);
						if (gram in this.matchDict) {
							for (i = 0; i < this.matchDict[gram].length; ++i) {
								index = this.matchDict[gram][i][0];
								otherGramCount = this.matchDict[gram][i][1];
								if (index in matches) {
									matches[index] += gramCount * otherGramCount;
								} else {
									matches[index] = gramCount * otherGramCount;
								}
							}
						}
					}

					function isEmptyObject(obj) {
						for(var prop in obj) {
							if(obj.hasOwnProperty(prop))
								return false;
						}
						return true;
					}

					if (isEmptyObject(matches)) {
						return null;
					}

					var vectorNormal = Math.sqrt(sumOfSquareGramCounts),
						results = [],
						matchScore;
					// build a results list of [score, str]
					for (var matchIndex in matches) {
						matchScore = matches[matchIndex];
						results.push([matchScore / (vectorNormal * items[matchIndex][0]), items[matchIndex][1]]);
					}
					var sortDescending = function(a, b) {
						if (a[0] < b[0]) {
							return 1;
						} else if (a[0] > b[0]) {
							return -1;
						} else {
							return 0;
						}
					};
					results.sort(sortDescending);
					if (this.useLevenshtein) {
						var newResults = [],
							endIndex = Math.min(50, results.length);
						// truncate somewhat arbitrarily to 50
						for (var i = 0; i < endIndex; ++i) {
							newResults.push([_distance(results[i][1], normalizedValue), results[i][1]]);
						}
						results = newResults;
						results.sort(sortDescending);
					}
					var newResults = [];
					for (var i = 0; i < results.length; ++i) {
						if (results[i][0] == results[0][0]) {
							newResults.push([results[i][0], this.exactSet[results[i][1]]]);
						}
					}
					return newResults;
				};

				fuzzyset.add = function(value) {
					var normalizedValue = this._normalizeStr(value);
					if (normalizedValue in this.exactSet) {
						return false;
					}

					var i = this.gramSizeLower;
					for (i; i < this.gramSizeUpper + 1; ++i) {
						this._add(value, i);
					}
				};

				fuzzyset._add = function(value, gramSize) {
					var normalizedValue = this._normalizeStr(value),
						items = this.items[gramSize] || [],
						index = items.length;

					items.push(0);
					var gramCounts = _gramCounter(normalizedValue, gramSize),
						sumOfSquareGramCounts = 0,
						gram, gramCount;
					for (var gram in gramCounts) {
						gramCount = gramCounts[gram];
						sumOfSquareGramCounts += Math.pow(gramCount, 2);
						if (gram in this.matchDict) {
							this.matchDict[gram].push([index, gramCount]);
						} else {
							this.matchDict[gram] = [[index, gramCount]];
						}
					}
					var vectorNormal = Math.sqrt(sumOfSquareGramCounts);
					items[index] = [vectorNormal, normalizedValue];
					this.items[gramSize] = items;
					this.exactSet[normalizedValue] = value;
				};

				fuzzyset._normalizeStr = function(str) {
					if (Object.prototype.toString.call(str) !== '[object String]') throw 'Must use a string as argument to FuzzySet functions'
					return str.toLowerCase();
				};

				// return length of items in set
				fuzzyset.length = function() {
					var count = 0,
						prop;
					for (prop in this.exactSet) {
						if (this.exactSet.hasOwnProperty(prop)) {
							count += 1;
						}
					}
					return count;
				};

				// return is set is empty
				fuzzyset.isEmpty = function() {
					for (var prop in this.exactSet) {
						if (this.exactSet.hasOwnProperty(prop)) {
							return false;
						}
					}
					return true;
				};

				// return list of values loaded into set
				fuzzyset.values = function() {
					var values = [],
						prop;
					for (prop in this.exactSet) {
						if (this.exactSet.hasOwnProperty(prop)) {
							values.push(this.exactSet[prop])
						}
					}
					return values;
				};


				// initialization
				var i = fuzzyset.gramSizeLower;
				for (i; i < fuzzyset.gramSizeUpper + 1; ++i) {
					fuzzyset.items[i] = [];
				}
				// add all the items to the set
				for (i = 0; i < arr.length; ++i) {
					fuzzyset.add(arr[i]);
				}

				return fuzzyset;
			};

			var root = this;
// Export the fuzzyset object for **CommonJS**, with backwards-compatibility
// for the old `require()` API. If we're not in CommonJS, add `_` to the
// global object.
			if (typeof module !== 'undefined' && module.exports) {
				module.exports = FuzzySet;
				root.FuzzySet = FuzzySet;
			} else {
				root.FuzzySet = FuzzySet;
			}

		})();

	},{}]},{},[1]);
