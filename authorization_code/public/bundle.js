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
				module.filter('getPerfs', function(linker) {
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
							return array
						}
						else{return perfs;}
					};
				});

				module.filter('getGenres', function(linker) {
					return function(genres,p) {

						// console.log("@getGenres");
						// console.log(genres);
						// console.log(p);

						let t = alasql("select * from artist_artistSongkick");
						// console.log(t);
						// console.log(alasql("select * from artist_artistSongkick aas join artists a on aas.artist_id = a.id"));

						//todo: no idea why this wasn't able to go get the actual genre object but whatever
						let qry = "select * from performances p"
							+ " JOIN artist_artistSongkick aas on p.artistSongkick_id = aas.artistSongkick_id"
							+ " JOIN artists_genres ag on aas.artist_id = ag.artist_id"
							// // + " JOIN artists a on aas.artist_id = a.id"
							// + " JOIN genres g on ag.genre_id = g.id"+
							+ " where aas.artistSongkick_id = " + p.artistSongkick_id;

						let qryResult = alasql(qry);
						//console.log(p.artistSongkick_id + "::",alasql(qry));


						let gens = [];


						// if(qryResult.length > 0){
						// 	let test = {};
						// 	test = qryResult[0]["genre_id"]
						// 	gens = alasql("select * from genres where id = " + test)
						// 	console.log("gens",gens);
						// }
						// else{
						// 	console.log("skipped: ",p.artistSongkick_id);
						// 	console.log(qryResult);
						// }

						!p.genres ? p.genres = gens:{};

						if(p && genres){
							let array = genres.map(function (item) {
								item.genres = gens;
								console.log(item.genres);
								return item;
							});
							return array
						}
						else{return genres;}
					};
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
					return function (input,user,usersGenres,family_freq_map) {
						console.log("byFamilyFreq",usersGenres.length);
						let output = JSON.parse(JSON.stringify(input));
						if(usersGenres.length !== 0) {
							output.sort(function (a, b) {
								return (family_freq_map[user.id][a] < family_freq_map[user.id][b]) ? 1 : -1
							})
						}
						return output
					}
				});

				module.filter('byGenreFreq', function () {
					return function (input,user,genre_freq_map) {
						input.sort(function(a,b){
							return (genre_freq_map[user.id][a.genre_id] < genre_freq_map[user.id][b.genre_id]) ? 1: -1
						})
						return input
					}
				});

				let controller = module.controller("myCtrl", function($scope,$http,linker) {
					console.log("myCtrl");
					$scope.sortType = "genreGroup"

					//===========================================================================================
					//DB SETUP AND TESTING

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
						return Object.values(object).map(function(value){
							// console.log(object);
							// console.log(typeof value);
							if(typeof value === 'object' && value !== null){
								//console.log("object");
								return '@'+JSON.stringify(value)
							}
							else{
								return "'" + value + "'"
							}
						}).join(",");
					};


					let defStr = function(def){
						let defStr = "";
						Object.keys(def).forEach(function(key,i){
							defStr = defStr + key + " " + def[key];
							if(Object.keys(def).length !== i + 1){defStr = defStr + ", "}
						});
						return defStr;
					};

					let reduce = function(def,record){
						let dkeys = Object.keys(def);
						let rkeys = Object.keys(record);
						rkeys.forEach(function(rk){
							if(dkeys.indexOf(rk) === -1){
								delete record[rk]
							}
						});
						return record;
					};


					let eventDef,performanceDef, artistDef, artists_genresDef, playlistDef, playlists_artistsDef,
						playlists_tracksDef, artists_tracksDef, trackDef,artist_artistSongkickDef;

					let create_defs = function(){

						eventDef = {
							id:"number",
							displayName:"string",
							type:"string",
							uri:"string",
							start:"string",
							location:"string",
							metro_id:"number"
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
							displayName:'Beppe Gambetta at United Church of Granville (February 3, 2019)',
							location:'Granville, OH, US',
							start:null,
							type:'Concert',
							uri:'http://www.songkick.com/concerts/36490829-beppe-gambetta-at-united-church-of-granville?utm_source=47817&utm_medium=partner',
							metro_id:9480
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

						let genreDefStr = "id number AUTOINCREMENT , name string, family json";
						alasql("CREATE TABLE genres (" + genreDefStr + ")");

						//example using json
						//https://github.com/agershun/alasql/wiki/JSON
						//alasql("INSERT INTO genres VALUES (null,'country rock',@['country','rock'])");

						// alasql("INSERT INTO genres VALUES ( " + vlister(genre_ex)  + " )");

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

					$scope.db = {};

					$scope.playlists = {};
					$scope.artists = {};
					$scope.genres = {};
					// $scope.playlists['1292167736'] = [];
					// $scope.playlists['1213866828'] = [];

					$scope.db.playlists = function(u){

						let qry = "select * from playlists where owner = '" + u.id + "' ";
						console.log(qry);
						console.log($scope.playlists[ u.id]);
						$scope.playlists[ u.id] = alasql(qry);
						console.log($scope.playlists[ u.id]);
						return $scope.playlists[ u.id];
					};


					$scope.testdb = function(user){
						user = {};
						user.id = '1292167736';
						console.log("playlists",alasql("select * from playlists"));
						console.log("playlists_tracks",alasql("select * from playlists_tracks"));

						let qry3 = "select p.id, pt.track_id as track_id, at.artist_id as artist_id, a.name as artist_name"
							+ " from playlists p join playlists_tracks pt on p.id = pt.playlist_id"
							+ " join artists_tracks at on pt.track_id = at.track_id"
							+ " join artists a on at.artist_id = a.id"
							+ " where p.owner  = '" + user.id + "' ";

						console.log(qry3);
						//!$scope.artists[user.id] ? $scope.playlists[user.id] = []:{};
						// $scope.artists[user.id] = alasql(qry3);
						// console.log(qry2,$scope.playlists[user.id]);
						console.log("testdb",alasql(qry3));

						console.log("6TZdvF1kFzwnQLgHQynzsO",alasql("select * from artists where id = '6TZdvF1kFzwnQLgHQynzsO'"));
					};

					$scope.testIn = function(){
						let playlists_ex = {
							id: "afsdfsdafasdfasdf",
							name: "Classic Rock/Rock",
							owner:"Jake Lavender",
							public: true,
							uri: "spotify:user:1292167736:playlist:5vDmqTWcShNGe7ENaud90q"
						};
						alasql("INSERT INTO playlists VALUES ( " + vlister(playlists_ex)  + " )");
						console.log("sel",alasql("select * from playlists;"));
						//$scope.applyIt();
					};

					//===========================================================================================
					//JS FILTERS / UI FLAGS and TOOLS

					$scope.shared = {};
					$scope.shared['genres'] = false;
					$scope.shared['artists']  = false;

					// $scope.genreFreq = function(v1, v2,user) {
					// 	console.log("$user",user);
					// 	return (user_cache[u.id]['genres_frequency'][v1] < user_cache[u.id]['genres_frequency'][v2]) ? -1 : 1;
					// };

					$scope.descendFreq = true;
					$scope.genreFreq = function(user) {

						return function(v1){
							if(!user){return null}
							else{return (user_cache[user.id]['genres_frequency'][v1]);}
						}
					};

					$scope.filterGenre = "";
					$scope.set_filterGenre = function(g){
						$scope.filterGenre = g;
						$scope.digestIt();
					};

					//todo: changed user_cache
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


					$scope.genres_frequency = function(genreTuple,user){

						//console.log("setting genres_frequency for ", user.display_name);


						//get the tracks that belong to this genre
						// var qry_tracks = "select a.id as artist_id, a.name as name, t.name as track_name, g.name as genre_name from "
						// 	+ " playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
						// 	+ " JOIN tracks t on t.id = pt.track_id"
						// 	+ " JOIN artists_tracks at on at.track_id = t.id"
						// 	+ " JOIN artists a on a.id = at.artist_id "
						// 	+ " JOIN artists_genres ag on a.id = ag.artist_id"
						// 	+ " JOIN genres g on g.id = ag.genre_id"
						// 	+  " where owner = '" + user.id + "' and g.id = " + genreTuple.genre_id + "";


						//select unique playlist->track->artists, and figure out how many times
						//a param genre is mentioned for that artist's genres
						//todo: couldn't figure this one out. instead did JS sorting on simple query

						let sub_qry = "select a.id as artist_id, a.name as name, t.name as track_name, g.name as genre_name, g.id as genre_id, g.family as family"
							+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							+ " JOIN tracks t on t.id = pt.track_id"
							+ " JOIN artists_tracks at on at.track_id = t.id"
							+ " JOIN artists a on a.id = at.artist_id "
							+ " JOIN artists_genres ag on a.id = ag.artist_id"
							+ " JOIN genres g on g.id = ag.genre_id"
							+  " where owner = '" + user.id + "' and g.id = " + genreTuple.genre_id;

						//putting distinct in here and using the sub-select stategy didn't seem to do shit
						//how is it that I'm already getting distinct artists w/out saying 'distinct' ?

						//also, although its not completely ignoring my sub_qry, its certainly not returning
						//artist results that are ONLY related to that genre_id
						var qry = "select artists.id as artist_id, artists.name as name"
							+ " from artists where ( " + sub_qry + " )";
						//if(genreTuple.genre_id === 1){console.log(qry);console.log(alasql(qry));}


						let used_artists = [];
						let results = alasql(sub_qry);

						//console.log("$r" ,results);

						results.forEach(function(rec){
							if(!$scope.genre_freq_map[user.id][rec.genre_id]){$scope.genre_freq_map[user.id][rec.genre_id] = 0;}
							if(used_artists.indexOf(rec.artist_id) === -1){
								$scope.genre_freq_map[user.id][rec.genre_id]++;
								used_artists.push(rec.artist_id)
							}

							//mostly only one family, if any
							if(rec.family.length > 0){
								rec.family.forEach(function(f){
									$scope.family_freq_map[user.id][f]++;
								})
							}

						});

						//console.log("$ffm" ,$scope.family_freq_map[user.id]);



						// console.log(genre_freq_map);
						// console.log(used_artists);

						//return genre_freq_map[genreTuple.genre_id ];

					};

					$scope.artists_frequency = function(artist,user){

						//give me as many tracks have this artist
						let qry = "select a.id as artist_id, a.name as name, t.name as track_name"
							+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
							+ " JOIN tracks t on t.id = pt.track_id"
							+ " JOIN artists_tracks at on at.track_id = t.id"
							+ " JOIN artists a on a.id = at.artist_id "
							+  " where owner = '" + user.id + "' and a.id = '" + artist.artist_id + "'"

						//console.log(alasql('select * from artists_tracks'));
						//console.log(qry);
						let results = alasql(qry);
						//console.log(results);
						results.forEach(function(rec){
							if(!$scope.artist_freq_map[user.id][rec.artist_id]){$scope.artist_freq_map[user.id][rec.artist_id] = 0;}
							$scope.artist_freq_map[user.id][rec.artist_id]++;
						});

						//console.log($scope.artist_freq_map[user.id]);
					};

					//===========================================================================================
					// INITIALIZATION AND UTILITIES

					//todo: figure out how to query this table with my spotify-gathered genres
					console.log(all_genres);
					$scope.familyGenre_map = {};
					$scope.genreFam_map = {};
					$scope.familyColor_map = global_familyColor_map;
					$scope.globalFamilies = globalFamilies;



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

					$scope.digestIt = function(){
						try{$scope.$digest();}
						catch(e){}
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

					let url_local = 'http://localhost:8888/';

					//depreciated
					var make_request_local =  function(payload){

						return new Promise(function(done, fail) {

							console.log("sending request : " + payload.type + " :: " + payload.url_postfix);
							console.log(payload);
							$.ajax({
								url: url_local + payload.url_postfix,
								type:payload.type,
								//TODO: what the fuck is wrong with this shit
								//data:JSON.stringify({test:"test"}),
								body: "FUCK"
								// contentType: 'application/json',
							}).done(function(payload){

								console.log("retrieved: ",payload);
								done(payload);

							})
								.fail(function(err){

									console.log("there was a problem: ");
									console.log(err);
								})
						})

					}; //make_request

					let getData = function (file) {return  $http.get(file);};

					$scope.user_cache = {};
					$scope.user_cache_ctrl = {};
					$scope.genre_freq_map = {};
					$scope.artist_freq_map = {};
					$scope.family_freq_map = {};

					// $scope.show = {};
					// $scope.show['dacandyman01'] = {};
					// $scope.show['1292167736'] = {};
					// $scope.show['1213866828'] = {};

					// $scope.show['dacandyman01']['playlists'] = true;
					// $scope.show['dacandyman01']['artists'] = false;
					// $scope.show['dacandyman01']['genres'] = true;
					//
					// $scope.show['1292167736']['playlists'] = true;
					// $scope.show['1292167736']['artists'] = false;
					// $scope.show['1292167736']['genres'] = true;
					//
					// $scope.show['1213866828']['playlists'] = true;
					// $scope.show['1213866828']['artists'] = false;
					// $scope.show['1213866828']['genres'] = true;


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
							$scope.genre_freq_map[u.id] = {};
							$scope.artist_freq_map[u.id] = {};

							$scope.user_cache_ctrl[u.id] = {}

							//selected
							$scope.user_cache_ctrl[u.id]['playlists'] = []
							$scope.user_cache_ctrl[u.id]['families'] = [];

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

					$scope.global_metro = {};

					getData('metros.json').then(function(data) {
						console.log(data) ;
						$scope.metros = data.data.metros;
						console.log($scope.metros);

						//todo: move somewhere else
						$scope.global_metro = $scope.metros[0];
					});

					$scope.global_user = {};

					//todo: default jake
					$scope.global_user = {
						"display_name": "Jake Lavender",
						"id": "1292167736"
					};

					$scope.set_user_cache = function(){
						//todo:

						// getData('dacandyman01_usercache_v1.json').then(function(data) {
						// 	$scope.setIt({id:'dacandyman01'},data.data);
						// });
						getData('jake_usercache_v1.json').then(function(data) {
							$scope.setIt({id:'1292167736'},data.data);
						});

					};

					$scope.setIt = function(user,cache){
						$scope.user_cache[user.id] = cache;
						//user_cache['global'].artists.full = user_cache['global'].artists.full.concat(user_cache[user.id].artists.full);
						//user_cache['global'].playlists.full = user_cache['global'].playlists.full.concat(user_cache[user.id].playlists.full);
						console.log($scope.user_cache);

						//recall process_playlists is the only process_ that sets user_cache
						//alasql("INSERT INTO playlists")
						$scope.process_playlists($scope.user_cache[user.id].playlists,user);

						$scope.user_cache[user.id].playlist_tracks.forEach(function(playTrackDuple){

							//alasql("INSERT INTO playlists_tracks, tracks, artists_tracks")
							$scope.process_tracks(playTrackDuple.tracks,playTrackDuple.playlist,user)
						});

						// alasql("INSERT INTO genres, artists_genres, artists")
						$scope.process_artists($scope.user_cache[user.id].artists_results,user);

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

						console.log("setting genre_freq map...");
						$scope.user_cache[user.id]['genres'].forEach(function(genre){
							$scope.genres_frequency(genre,user);
						});

						console.log("setting artist_freq map...");
						$scope.user_cache[user.id]['artists'].forEach(function(artist){
							$scope.artists_frequency(artist,user);
						});

						console.log("setIt results",$scope.user_cache[user.id]);
						$scope.digestIt()
					};

					// $scope.setSelected = function(array,mode){
					// 	console.log("setSelected",mode);
					// 	array.forEach(function(ar){
					// 		ar._cmo_checked = (mode === 'all');
					// 	})
					// };

					$scope.selected = {};
					$scope.selected['playlists'] = []

					// $scope.setP = function(){
					//
					// 	$scope.testPlaylists = $scope.user_cache['1292167736']['playlists'];
					// 	console.log($scope.testPlaylists );
					// 	$scope.digestIt()
					// }

					$scope.testPlaylists = [
						{
							"id": "5vDmqTWcShNGe7ENaud90q",
							"name": "Classic Rock/Rock",
							"owner": "1292167736",
							"public": "true",
							"uri": "spotify:playlist:5vDmqTWcShNGe7ENaud90q",
							// "_cmo_checked": true
						},
						{
							"id": "0sJK4pWqr7bnQ0fgxGmJrh",
							"name": "weird shit",
							"owner": "1292167736",
							"public": "true",
							"uri": "spotify:playlist:0sJK4pWqr7bnQ0fgxGmJrh",
							// "_cmo_checked": true
						},
						{
							"id": "0fEQxXtJS7aTK4qrxznjAJ",
							"name": "country",
							"owner": "1292167736",
							"public": "true",
							"uri": "spotify:playlist:0fEQxXtJS7aTK4qrxznjAJ",
							// "_cmo_checked": true
						}
					]

				// 	$scope.testPlaylistsLookup = {
				// 		"5vDmqTWcShNGe7ENaud90q":{
				// 			"id": "5vDmqTWcShNGe7ENaud90q",
				// 			"name": "Classic Rock/Rock",
				// 			"owner": "1292167736",
				// 			"public": "true",
				// 			"uri": "spotify:playlist:5vDmqTWcShNGe7ENaud90q",
				// 			// "_cmo_checked": true
				// 		},
				// 		"0sJK4pWqr7bnQ0fgxGmJrh":{
				// 			"id": "0sJK4pWqr7bnQ0fgxGmJrh",
				// 			"name": "weird shit",
				// 			"owner": "1292167736",
				// 			"public": "true",
				// 			"uri": "spotify:playlist:0sJK4pWqr7bnQ0fgxGmJrh",
				// 			// "_cmo_checked": true
				// 		},
				// 		"0fEQxXtJS7aTK4qrxznjAJ":{
				// 			"id": "0fEQxXtJS7aTK4qrxznjAJ",
				// 			"name": "country",
				// 			"owner": "1292167736",
				// 			"public": "true",
				// 			"uri": "spotify:playlist:0fEQxXtJS7aTK4qrxznjAJ",
				// 			// "_cmo_checked": true
				// 		}
				// }

					$scope.familySelected = function(u,f){
						return $scope.user_cache_ctrl[u.id]['families'].indexOf(f) !== -1;
						// let ret = $scope.user_cache_ctrl[u.id]['families'].indexOf(f) !== -1;
						// console.log("familySelected",ret);
						// return ret
					};

					$scope.toggleFamily = function(u,f){
						let index = $scope.user_cache_ctrl[u.id]['families'].indexOf(f);
						if(index !== -1){
							$scope.user_cache_ctrl[u.id]['families'].splice(index,1)
						}
						else{
							$scope.user_cache_ctrl[u.id]['families'].push(f);
						}
					};


					$scope.getSelectedGenres = function(u){
						let total = 0;
						$scope.user_cache_ctrl[u.id]['families'].forEach(function(f){
							total+= $scope.familyGenre_map[f].length
						})
						return total;
					};

					$scope.lookup = {};
					$scope.lookup['genres'] = {};
					$scope.lookup['playlists'] = {};

					$scope.playlistLookup = function(id){
						return $scope.lookup['playlists'][id]
					}

					$scope.genreLookup = function(genre_id){
						return $scope.lookup['genres'][genre_id];
					};


					//===========================================================================================
					// SONGKICK EVENTS

					//todo: depreciated by weird filters above

					// $scope.perfs = [];
					// $scope.getPerfs = function(e){
					//
					// 	//let qry = "select top 10 * from events e JOIN events_performances ep on e.id = ep.event_id JOIN performances p on p.id = ep.performance_id";
					// 	let qry = "select * from events e"
					// 		+ " JOIN events_performances ep on e.id = ep.event_id"
					// 		+ " JOIN performances p on p.id = ep.performance_id"
					// 		+ " where e.id = " + e.id;
					// 	//perfs = alasql(qry);
					//
					// 	//var retVal = e;
					// 	$scope.perfs = alasql(qry);
					// 	return linker($scope.perfs,'some-key')
					// };
					//
					// $scope.getGenres = function(p){
					// 	let qry = "select * from performances p"
					// 		+ " JOIN artist_artistSongkick aas on p.artistSongkick_id = aas.artistSongkick_id"
					// 		+ " JOIN artists_genres ag on aas.artist_id = ag.artist_id"
					// 		// + " JOIN artists a on aas.artist_id = a.id"
					// 		+ " JOIN genres g on ag.genre_id = g.id"
					// 		+ " where aas.artistSongkick_id = " + p.artistSongkick_id;
					//
					// 	let genres = [];
					// 	let results = alasql(qry);
					//
					// 	results.forEach(function(r){
					// 		if(genres.indexOf(r.name) === -1){
					// 			genres.push(r.name)
					// 		}
					// 	});
					//
					// 	// if(p.artistSongkick_id === 8401188){
					// 	// 	// console.log( alasql("select * from artist_artistSongkick"));
					// 	// 	// console.log( alasql("select * from artists_genres"));
					// 	// 	// console.log(qry);
					// 	// }
					//
					// 	return genres;
					// };




					$scope.metro_cache = {};
					$scope.metro_cache_performances = {}

					$scope.dateFilter= {};
					//$scope.dateFilter.end = "";
					//$scope.dateFilter.start = "";
					 $scope.dateFilter.end =  '2019-04-04';
					// $scope.dateFilter.start = '2019-03-04';
					$scope.dateFilter.start =  '2019-03-04';
					// $scope.dateFilter.end = '2019-03-11';
					// $scope.raw_filename = "";
					// $scope.areaDatesArtists_filename= "";


					//can i turn this into a filter or something?
					$scope.getEventDate = function(event){

						var weekday = new Array(7);
						weekday[0] =  "Sun";
						weekday[1] = "Mon";
						weekday[2] = "Tues";
						weekday[3] = "Wed";
						weekday[4] = "Thurs";
						weekday[5] = "Fri";
						weekday[6] = "Sat";

						// var weekday_full = new Array(7);
						// weekday_full[0] =  "Sunday";
						// weekday_full[1] = "Monday";
						// weekday_full[2] = "Tuesday";
						// weekday_full[3] = "Wednesday";
						// weekday_full[4] = "Thursday";
						// weekday_full[5] = "Friday";
						// weekday_full[6] = "Saturday";

						var date = new Date(event.start);
						var m = date.getUTCMonth() + 1;
						var d = date.getUTCDate();
						var y  = date.getFullYear();
						var day = date.getUTCDay();
						var newDate = weekday[day] + ", " + m + "-" + d + "-" + y
						return newDate;
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
							console.log("get_metro_events results",events);
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

								//sanitize
								let varchar_keys = ["displayName"];
								varchar_keys.forEach(function(key) {	event[key] = event[key].replace(/'/g, "''");});

								//console.log(event);

								event.location ? event.location = event.location.city :  event.location = "not specified";
								event.start = event.start.datetime;

								reduce(eventDef,event);
								//console.log(vlister(event));

								alasql("INSERT INTO events VALUES ( " + vlister(event)  + " )");

							}); //res.data

							let req = {};
							req.url_postfix = "search_artists";
							req.type = "POST";
							req.body = {};
							req.body.perfTuples = artist_search_payload;
							let params = getHashParams();
							req.body.token = params.access_token;

							//TODO: this doesn't seem right...too many repeats, seems to obviously be missing some
							console.log("artist_search_payload",JSON.parse(JSON.stringify(artist_search_payload)));

							$http.post(url_local + req.url_postfix,req.body).then(function(res){
								console.log("$results",res.data);

								let artist_artistSongkick = {};
								let payloads = [];
								let payload = {artists:[]}

								res.data.forEach(function(tuple){

									if(tuple.error){$scope.unresolved_artists.push(tuple.displayName)}
									else{

										//todo: somethings a little fucked here, don't know what though
										tuple.artist.name === "Consider the Source" ? console.log(tuple):{};

										artist_artistSongkick.artist_id = tuple.artist.id;
										artist_artistSongkick.artistSongkick_id = tuple.artistSongkick_id;
 										alasql("INSERT INTO artist_artistSongkick VALUES ( " + vlister(artist_artistSongkick)  + " )");


										payload.artists.push(tuple.artist)
										//console.log("$len",payload.artists.length);
										// tuple = reduce(artistDef,tuple.spotify_artist);
										// let varchar_keys = ["name"];
										// varchar_keys.forEach(function (key) {
										// 	tuple[key] = tuple[key].replace(/'/g, "''");
										// });
										//
										// alasql("INSERT INTO artists VALUES ( " + vlister(tuple)  + " )");
									}
								});

								//process_artists has weird params
								payloads.push(payload);
								$scope.process_artists(payloads);


								console.log("unresolved_artists",$scope.unresolved_artists);

								//todo: modify for multiple metro calls

								// $scope.metro_cache[events[0].metro_id] = events;
								$scope.metro_cache[events[0].metro_id] = alasql("select * from events;");

								console.log("metro_cache",$scope.metro_cache);
								console.log('events:',alasql("select * from events;"));
								console.log('performances:',alasql("select * from performances;"));
								console.log('events_performances:',alasql("select * from events_performances;"));
								console.log('artist_artistSongkick:',alasql("select * from artist_artistSongkick;"));

								let qry = "select * from events e JOIN events_performances ep on e.id = ep.event_id JOIN performances p on p.id = ep.performance_id";
								console.log(qry,alasql(qry));

								$scope.digestIt();

							});//all


						})//$http
					};


					//===========================================================================================
					// SPOTIFY RECORDS


					/**
					 * load my playlists into cache.playlists.simple, cache.playlists.full, and
					 * mapped by user into cache.playlists.userMap
					 * @function user_playlists
					 **/
					$scope.get_user_playlists =function(user){
						var url1 = "/playlists";

						//var url_example = "https://api.spotify.com/v1/users/dacandyman01/playlists?offset=0&limit=50"
						//var test_console = "https://beta.developer.spotify.com/console/get-playlists/?user_id=wizzler&limit=&offset=";

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

							let qry_distinct_artists = "select distinct artists.id as artist_id, artists.name as name"
								+ " from artists where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								+ " JOIN tracks t on t.id = pt.track_id"
								+ " JOIN artists_tracks at on at.track_id = t.id"
								+ " JOIN artists a on a.id = at.artist_id "
								// + " JOIN artists_genres ag on a.id = ag.artist_id"
								// + " JOIN genres g on g.id = ag.genre_id"
								+  " where owner = '" + user.id + "')";

							console.log(qry_distinct_artists);
							console.log(alasql("select * from artists"));
							$scope.user_cache[user.id]['artists'] =  alasql(qry_distinct_artists);
							console.log("setting artist_freq map...");
							$scope.user_cache[user.id]['artists'].forEach(function(artist){
								$scope.artists_frequency(artist,user);
							});

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

							console.log(qry_distinct_genres);
							$scope.user_cache[user.id]['genres'] = alasql(qry_distinct_genres);
							console.log("setting genre_freq map...");
							$scope.user_cache[user.id]['genres'].forEach(function(genre){
								$scope.genres_frequency(genre,user);
							});

							//console.log(alasql("select * from genres"));
							console.log("select distinct_genres for user_id = " + user.id + "",$scope.user_cache[user.id]['genres']);
							console.log("select distinct_artists for user_id = " + user.id + "",$scope.user_cache[user.id]['artists']);


							//console.log("select * from tracks;", alasql("select * from tracks;"));
							let qry_distinct_tracks = "select distinct tracks.id as track_id, tracks.name as track_name"
								+ " from tracks where ( select a.id as artist_id, a.name as name, t.name as track_name from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								//+ " from playlists p JOIN playlists_tracks pt on p.id = pt.playlist_id "
								+ " JOIN tracks t on t.id = pt.track_id"
								+ " JOIN artists_tracks at on at.track_id = t.id"
								+ " JOIN artists a on a.id = at.artist_id "
								// + " JOIN artists_genres ag on a.id = ag.artist_id"
								// + " JOIN genres g on g.id = ag.genre_id"
								+  " where owner = '" + user.id + "')";

							console.log(qry_distinct_tracks);

							$scope.user_cache[user.id].tracks =  alasql(qry_distinct_tracks);
							console.log($scope.user_cache[user.id].tracks);

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


					/**Process all the 50 artist promise payloads we submitted.
					 * alasql("INSERT INTO genres, artists_genres, artists")
					 *
					 * @function $scope.process_artists
					 **/
					$scope.process_artists = function(results){

						console.log("$process_artists");
						console.log(results);

						//use this to print batches of resolved artists out to console
						//in order to use as set_user_cache data
						//console.log(JSON.stringify(results,null,4));

						let all_artists = [];
						results.forEach((r)=>{all_artists = all_artists.concat(r.artists)});

						console.log(all_artists.length);

						//create a map of unique genres and their artists

						let unique_genre_artist_map = {};
						all_artists.forEach(function(ar){

							//todo: null sometimes? hows that happen exactly..?
							if(ar){
								ar.genres.forEach((g)=>{
									if(!unique_genre_artist_map[g]){
										unique_genre_artist_map[g] = {artists:[]}
									}
									if(unique_genre_artist_map[g].artists.indexOf(ar) === -1){
										unique_genre_artist_map[g].artists.push(ar);
									}
								});

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
						let genreInd = 0;

						//insert each genre, artist_genre and UNIQUE artist into their respective tables
						//console.log("here");

						let no_family = [];
						for(let key in unique_genre_artist_map){
							//console.log("here");
							genre = {};
							genre.id = ++genreInd;
							genre.name = key;
							if($scope.genreFam_map[genre.name] !== undefined){
								genre.family = $scope.genreFam_map[genre.name];
							}
							else{
								genre.family = "";
								no_family.push(genre)
							}


							$scope.lookup['genres'][genre.id] = key;
							alasql("INSERT INTO genres VALUES ( " + vlister(genre)  + " )");
							//console.log(alasql("select * from  genres"));

							unique_genre_artist_map[key].artists.forEach(function(ar){
								artist_genre = {};
								artist_genre.artist_id = ar.id;
								artist_genre.genre_id = genreInd;
								alasql("INSERT INTO artists_genres VALUES ( " + vlister(artist_genre)  + " )");

								// //there will 100% be duplicate artists over genres,
								// //so don't insert them twice
								// if(inserted_artists.indexOf(ar.id) === -1) {
								// 	reduce(artistDef, ar);
								// 	let varchar_keys = ["name"];
								// 	varchar_keys.forEach(function (key) {
								// 		ar[key] = ar[key].replace(/'/g, "''");
								// 	});
								// 	alasql("INSERT INTO artists VALUES ( " + vlister(ar) + " )");
								// 	inserted_artists.push(ar.id)
								// }
							});
						}

						console.log("inserted_artists",inserted_artists.length);

						//todo:
						console.warn("couldn't find a family for these genres",no_family);

						//console.log("select * from artists_genres;",alasql("select * from artists_genres;"));

						// let qry = "select a.id AS artist_id, a.name AS artist_name, g.id AS genre_id, g.name AS genre_name " +
						// 	"from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id";
						// console.log("join artists with their genres",alasql(qry));

					};

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
								console.log("subset ",plays);
							}
							else{
								let qry = "select * from playlists where owner = '" + user.id + "' ";
								plays = alasql(qry);
								console.log(qry,plays);
							}

							let promises = [];
							plays.forEach(function(play){
								let payload = {};
								payload.url_postfix = "playlist_tracks";
								payload.type = "POST";
								payload.body = {};
								payload.body.playlist = play;

								let params = getHashParams();
								payload.body.token = params.access_token;


								//console.log(payload);
								promises.push($http.post(url_local + payload.url_postfix,payload.body));
							});

							//console.log("sending request : " + payload.type + " :: " + payload.url_postfix);

							Promise.all(promises).then(function(res){

								console.log("$playlistTrackMap",res);

								let artist_list = [];
								res.forEach(function(resp){
									artist_list = artist_list.concat($scope.process_tracks(resp.data.tracks,{id:resp.data.playlist_id}))
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

								console.log("$payloads",payloads);

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

								//TODO:
								// let test = [];
								// test.push(req_all.body.queries[1])
								// req_all.body.queries = test;

								console.log("# of payload strings:",payload_strs.length);
								console.log("req_all.body.queries",req_all.body.queries);
								$http.post(url_local + req_all.url_postfix,req_all.body).then(function(results){
									console.log("$get_artists");
									console.log(results.data);
									$scope.process_artists(results.data);

									// console.log("select * from genres;",alasql("select * from genres;"));
									// console.log("select * from artists;",alasql("select * from artists;"));
									// console.log("select * from artists_genres;",alasql("select * from artists_genres;"));

									// let qry = "select a.id AS artist_id, a.name AS artist_name, g.id AS genre_id, g.name AS genre_name " +
									// 	"from artists a JOIN artists_genres ag on a.id = ag.artist_id JOIN genres g on g.id = ag.genre_id";
									// console.log("join artists with their genres",alasql(qry));

									done();
								})//promise all
							})//post then
						})};//playlist_tracks

				}); //controller


				var cache = {};
				let user_cache = {};
				user_cache['global'] = {artists:{full:[],simple:[]},playlists:{full:[],simple:[]},artistsInfoMap:{},artistsSongkickSpotifyMap:{}};

				let clean_cache = function(cache){
					cache.dummy = [];
					cache.artists = {};
					cache.playlists = {};

					cache.artists.simple = [];
					cache.artists.full = [];

					cache.artistsInfoMap = {};
					cache.artistsInfoMap_simple = {};

					cache.playlists.simple  = [];
					cache.playlists.full = [];

					cache.tracks = [];
					cache.genres = [];
					cache.genres_artist_map = {};
					cache.genres_frequency = {};

					cache.playlist_tracks_map = {};
					cache.user_playlist_map_full = {};
					cache.user_playlist_map_simple = {};
				};
				clean_cache(cache);

				exports.clean_cache = clean_cache;

				//spotify api doesn't seem to care if I fuck up these url formations:
				//https://api.spotify.com/v1/users/dacandyman01/playlists?&offset=150&limit=50
				//gets parsed as
				//https://api.spotify.com/v1/users/dacandyman01/playlists?offset=150&limit=50

				var url_users = "https://api.spotify.com/v1/users";
				var off = "&offset=";
				var lim = "&limit=";
				var offset_base = 50;

				var page_num = 0;
				var records = [];


				/**
				 * Designed for paging requests
				 * trying to reuse my request maker
				 * url_object:
				 *
				 *  Always explicitly set to "" if not in use
				 * 	url_object.fields = ""
				 *
				 **/
				var make_request =  function(url_object,cache,sleep){

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




				/**
				 * //todo: needs to be generalized
				 * Designed for one-off requests
				 * Only reads the URL from the url_object
				 * doesn't care if we fail, still calls done
				 * @function make_request_simple
				 **/
				var make_request_simple =  function(req,cache,sleep){

					return new Promise(function(done, fail) {

						let params = getHashParams();
						global_access_token = params.access_token;
						//console.log("sending request", req.url);

						var call =  function(req){
							return new Promise(function(done, fail) {

								$.ajax({
									dataType: 'json',
									beforeSend: function (request) {
										request.setRequestHeader("Authorization", 'Bearer ' + global_access_token);
									},
									url: req.url,
								}).done(function(payload){

									console.log("retrieved: ",payload);
									cache[payload.id] = payload;
									done(payload)
								})
									.fail(function(err){
										console.error("make_request_simple has a problem: ",err);
										done(cache)
									})
							})
						};
						var sleepIt =  function(myPromise,ms){
							return new Promise(function(done, fail) {
								setTimeout(done(myPromise),ms);
								// setTimeout(function(){
								// 	console.log("sleeping....",ms);
								// 	// done({sleep:ms});},ms)
								// 	done(myPromise)
								// },ms)
							})
						};

						//	call(req);
						let promises = [];

						sleepIt(call(req),100).then(function(res){
							done(res)
						})

						// promises.push();
						// promises.push();

						// Promise.all([sleepIt(call(req),1200)]).then(function(resultSleep){
						// 	console.log("single request chain finish");
						// 	//resultSleep is always a tuple where the 2nd value is undefined
						// 	//b/c sleep it returns nothing
						// 	console.log(resultSleep);
						// 	done(resultSleep)
						//
						// });

						// sleepIt(call(req),1200).then(function(res){
						// 	done(res)
						// })
					})
				}; //make_request_simple


				/**
				 * load a static json version of my playlists into user_playlists_simple_cache
				 * @function load_playlists
				 **/
				exports.load_playlists = function(){
					$.getJSON("my_playlists.json", function( data ) {
						var items = [];
						cache.playlists.simple = data.playlists;
						console.log("user_playlists_simple_cache loaded:",cache.playlists.simple);
					});
				};

				/**
				 * load a specified subset of playlists
				 * @function load_playlists
				 **/
				var switchIt = 2;

				exports.load_playlists_select = function(){

					console.log("load_playlists_select...");
					cache.playlists.simple = [];
					var user = "";

					switch(switchIt) {
						case 1:
							user = "spotify"
							cache.playlists.simple.push(cache.user_playlist_map_simple[user][0]);//discover
							cache.playlists.simple.push(cache.user_playlist_map_simple[user][8]);//2016
							cache.playlists.simple.push(cache.user_playlist_map_simple[user][9]) //2017

							break;
						case 2:
							//user = "dacandyman01"
							user = "123073652"
							cache.playlists.simple = cache.user_playlist_map_simple[user]
							break;
						case 3:
							user = "dacandyman01"
							var private_playlists = [

								{
									"id": "5qdfEl1ylx7MLZTmJXydSJ",
									"name": "Electronic You"
								},
								{
									"id": "2WFJbnFtt6Kd0ULu7xLD8I",
									"name": "Dopeness (Mass Appeal)"
								},
								{
									"id": "2CpL2V6u1PQHK7tBhvU1Oo",
									"name": "campfire radio 1"
								}];
							cache.playlists.simple = private_playlists;
							break;

						default:

					}

					console.log("user_playlists_simple_cache loaded:",cache.playlists.simple);
					return user;

				};

				/**
				 * Do a quick profile fetching test
				 * @function testAPI
				 **/
				exports.testAPI = function(op){
					console.log("testAPI");

					switch(op) {
						case "user":
							var params = getHashParams();
							global_access_token =  params.access_token
							console.log("global_access_token set: ",global_access_token);

							$.ajax({
								dataType: 'json',
								beforeSend: function(request) {
									request.setRequestHeader("Authorization", 'Bearer ' + global_access_token );
								},
								url:"https://api.spotify.com/v1/me",
								success: function(body) {
									console.log("body: ",body);
									console.log("testAPI success!");
								}
							});
							break;

						case "playlistTracks":
							//https://developer.spotify.com/console/get-playlist-tracks/?playlist_id=&market=&fields=&limit=&offset=
							console.log("playlistTracks");
							var url_object = {};
							let playlist = {};playlist.id = "37i9dQZEVXcGolgKZUussr";
							url_object.url =  "https://api.spotify.com/v1/playlists/"+ playlist.id +"/tracks"
							url_object.offset = 0;
							url_object.limit = 50;
							url_object.fields = "fields=items.track.artists";
							console.log('fetching playlist_tracks for : ' + playlist.id );
							cache.dummy = [];
							make_request(url_object,cache.dummy).then(function(result){

								console.log(result);
							}).catch(function(err){
								console.error(err);
							})
							break;
						case "artist":
							console.log("artist");

							var url_object = {};
							let artist = {};artist.id = "2utNxkLhreF1oIfO8kQT3q";
							url_object.url =  "https://api.spotify.com/v1/artists/" + artist.id;
							url_object.offset = 0;
							url_object.limit = 50;
							url_object.fields = "fields=items.track.artists";
							console.log('fetching artist profile for : ' + artist.id );
							cache.dummy = [];
							make_request_simple(url_object,cache.dummy).then(function(result){

								console.log(result);
							}).catch(function(err){
								console.error(err);
							})
							break;
						default:
						// code block
					}

				} //testAPI


				/////////////////////////////////////
				//OUTDATED
				/////////////////////////////////////

				/**
				 * Fetch a user's top artists.
				 * @function top_artists
				 * For each time range, the top 100 tracks and artists are available for each user.
				 * In the future, it is likely that this restriction will be relaxed.
				 * This data is typically updated once each day for each user.
				 **/
				exports.top_artists = function(user){

					//todo: disabled hash fetching

					// var params = getHashParams();
					// global_access_token = params.access_token
					console.log(global_access_token);
					console.log('fetching artists for user: ' + user );
					//var url = 'https://api.spotify.com/v1/me/top/artists
					// https://beta.developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/

					//max(limit) = 50,
					//time_range = [long_term (several years?), medium_term (~ 6 months), short_term (~ 4 weeks). Default: medium_term.]
					// The index of the first entity to return. Default: 0 (i.e., the first track). Use with limit to get the next set of entities.

					var records = [];
					var offset_count = 0;
					var offset = 0;

					var make_request =  function(user,offset,callback){

						// var url = "https://api.spotify.com/v1/me/top/artists";

						//trying to figure this out, think there are max  100 top artists?
						//"For each time range, the top 50 tracks and artists are available for each user"
						//but i feel like using offset = 0, then offset = 49 on the second call gets me 100 unique?

						//todo: check uniqueness
						//https://beta.developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/


						var url = 'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50&offset=' + offset
						$.ajax({
							dataType: 'json',
							beforeSend: function(request) {
								request.setRequestHeader("Authorization", 'Bearer ' + global_access_token );
								//var temp_token = "BQClTYekdyT4Fyt3yXsEv6BUfzSly9ihQm1FI6NusqXxeefaxaT0mAuCDL1efdF2HzZKKYqzJw1bMlDQwS9pUZqdZ4ysTDy5oVpCefsNv-O5_9KiYW87lpEZXNRKRQ_YqRKHuuf3RnlTArsBMCuZfU3B6w"
								//request.setRequestHeader("Authorization", 'Bearer ' + temp_token );
							},
							url:url,
							success: function(payload) {
								console.log('payload: ');
								// console.log(JSON.stringify());
								console.log(payload);

								callback(payload)
							},
							error: function(err) {
								console.log("there was a problem: ");
								console.log(err);
							}
						});
					}

					var check_len = function(payload){


						var results = payload["items"]

						results.forEach(function(result){   records.push(result)})

						if(results.length == 50){

							offset_count++
							console.log("offset_count: "  + offset_count);

							offset = offset_count * 50 - 1 //50 records is max

							console.log("offset: "  + offset);

							console.log("... " + records.length);
							make_request(user,offset,check_len)
						}
						else{
							console.log("finished, # of records: " + records.length);
							console.log(records);
						}

					}

					var starting_offset = 0;
					var results = make_request(user,starting_offset,check_len)




				};//top_artists

				//apples, grapes, honey, carrots/broc, potatoes


				/**
				 * Fetch a user's saved tracks
				 * @URL  https://beta.developer.spotify.com/console/get-current-user-saved-tracks/
				 * @function user_tracks
				 *
				 **/
				exports.user_tracks = function(user){

					var params = getHashParams();
					global_access_token = params.access_token

					console.log('fetching tracks for user: ' + user);
					//var url = 'https://api.spotify.com/v1/me/top/artists
					// https://beta.developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/

					//max(limit) = 50,
					//time_range = [long_term (several years?), medium_term (~ 6 months), short_term (~ 4 weeks). Default: medium_term.]
					// The index of the first entity to return. Default: 0 (i.e., the first track). Use with limit to get the next set of entities.

					var records = [];
					var offset_count = 0;
					var offset = 0;

					var make_request =  function(user,offset,callback){

						console.log("make_request!!!!!!!");

						console.log("params: " + user + " " + offset);

						var url = 'https://api.spotify.com/v1/me/tracks?offset=' + offset + '&limit=50'
						$.ajax({
							dataType: 'json',
							beforeSend: function(request) {
								request.setRequestHeader("Authorization", 'Bearer ' + global_access_token );
								//var temp_token = "BQClTYekdyT4Fyt3yXsEv6BUfzSly9ihQm1FI6NusqXxeefaxaT0mAuCDL1efdF2HzZKKYqzJw1bMlDQwS9pUZqdZ4ysTDy5oVpCefsNv-O5_9KiYW87lpEZXNRKRQ_YqRKHuuf3RnlTArsBMCuZfU3B6w"
								//request.setRequestHeader("Authorization", 'Bearer ' + temp_token );
							},
							url:url,
							success: function(payload) {
								console.log('payload: ');
								console.log(payload);
								callback(payload)

							},
							error: function(err) {
								console.log("there was a problem: ");
								console.log(err);
							}
						});
					}

					var check_len = function(payload){

						var results = payload["items"]

						results.forEach(function(result){   records.push(result)})

						if(results.length == 50){

							offset_count++
							console.log("offset_count: "  + offset_count);

							offset = offset_count * 50 - 1 //50 records is max

							console.log("offset: "  + offset);

							console.log("... " + records.length);
							make_request(user,offset,check_len)
						}
						else{
							console.log("finished, # of records: " + records.length);
							console.log(records);
						}

					}

					var starting_offset = 0;
					var results = make_request(user,starting_offset,check_len)




				}//user_tracks

				/**
				 * hmmmmmmmm....
				 * @function doSearch
				 **/

				//todo: not sure what the status is here...
				exports.doSearch = function(word, callback) {

					console.log("DOSEARCH");
					console.log(word);
					console.log(callback);



					console.log('search for ' + word);
					var url = 'https://api.spotify.com/v1/search?type=track&limit=50&q=' + encodeURIComponent('track:"'+word+'"');
					$.ajax(url, {
						dataType: 'json',
						success: function(r) {
							console.log('got track', r);
							callback({
								word: word,
								tracks: r.tracks.items
									.map(function(item) {
										var ret = {
											name: item.name,
											artist: 'Unknown',
											artist_uri: '',
											album: item.album.name,
											album_uri: item.album.uri,
											cover_url: '',
											uri: item.uri
										}
										if (item.artists.length > 0) {
											ret.artist = item.artists[0].name;
											ret.artist_uri = item.artists[0].uri;
										}
										if (item.album.images.length > 0) {
											ret.cover_url = item.album.images[item.album.images.length - 1].url;
										}
										return ret;
									})
							});
						},
						error: function(r) {
							callback({
								word: word,
								tracks: []
							});
						}
					});
				}


				/**
				 * Refresh the token using the current access_token and refresh_token in the URL
				 * @function refreshToken
				 **/
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

				exports.callback = function(idk) {

					console.log("callback executed");
					console.log(idk);
				}

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
