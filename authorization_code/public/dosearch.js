/**
 * Created by begue.16 on 9/27/2017.
 */

//sourced from:

//examples:
//https://developer.spotify.com/web-api/code-examples/

//repo for playlist creator

//https://github.com/possan/playlistcreator-example/blob/master/app.js
//https://github.com/possan/playlistcreator-example/blob/master/index.html



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


		var module = angular.module('playlistGen', []);

		//todo: only designed for two people
		module.filter('sharedFilter', function() {
			return function(input,type,shared) {

				console.log(shared[type]);
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

		var controller = module.controller("myCtrl", function($scope,$http) {
			console.log("myCtrl");
			$scope.test = "test";

			$scope.shared = {};
			$scope.shared['genres'] = false;
			$scope.shared['artists']  = false;

			let postData = function (addy,payload) {
				return  $http.post(addy,payload);
			};

			$scope.testPost = function(){
				postData('localhost:8887/test',{test:"in"}).then(function(data) {
					console.log(data) ;
					//$scope.$apply();
				});
			};

			let getData = function (file) {
				return  $http.get(file);
			};

			getData('friends_id_map.json').then(function(data) {
				console.log(data) ;
				$scope.users = data.data.friends;
				console.log($scope.users);
				//$scope.$apply();
			});

			getData('metros.json').then(function(data) {
				console.log(data) ;
				$scope.metros = data.data.metros;
				console.log($scope.metros);
				//$scope.$apply();
			});

			var make_request_local =  function(url_object,cache){

				return new Promise(function(done, fail) {

					var url_local = "http://localhost:8888/";
					console.log("sending request : " + url_object.type + " :: " + url_object.url);
					$.ajax({
						url: url_local + url_object.url,
						type:url_object.type
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

			$scope.testEndpoint = function(){

				var req = {};
				req.type = "GET";
				req.url = "test";

				make_request_local(req).then(function(result){

					console.log("result",result);

					console.log("testEndpoint finished!");
				})
			};

			$scope.global_user = {};

			$scope.set_user = function(user){
				console.log("set user:",user);
				global_user = user;
				$scope.global_user = user;
			};
			$scope.set_metro = function(metro){
				console.log("set_metro:",metro);
				//global_metro = metro;
				$scope.global_metro = metro;
			};

			//TODO: CORS policy blocks (ITS TO THE SAME SITE THO WTF

			$scope.get_metro_events = function(metro){
				console.log("get_metro_events hook",metro);

				postData('localhost:8888/get_metro_events',{metro:metro})
					.then(function(data) {
						console.log("get_metro_events returns:",data);
					//$scope.$apply();
				}).catch(function(err){
					console.error(err)

				})
			};


			$scope.get_all_tracks = exports.get_all_tracks;
			$scope.get_user_playlists = exports.get_user_playlists;

			$scope.set_user_cache = function(){
				getData('dacandyman01_usercache_v1.json').then(function(data) {
					exports.set_user_cache({id:'dacandyman01'},data.data);
				});
				getData('jake_usercache_v1.json').then(function(data) {
					exports.set_user_cache({id:'1292167736'},data.data);
				});
			};

			//todo: hardcoded, should just run thru friends map
			$scope.show = {};
			$scope.show['dacandyman01'] = {};
			$scope.show['1292167736'] = {};

			$scope.show['dacandyman01']['playlists'] = true;
			$scope.show['dacandyman01']['artists'] = true;
			$scope.show['dacandyman01']['genres'] = true;

			$scope.show['1292167736']['playlists'] = true;
			$scope.show['1292167736']['artists'] = true;
			$scope.show['1292167736']['genres'] = true;

			$scope.user_cache = user_cache;

			$scope.applyIt = function(){
				try{$scope.$apply();}
				catch(e){}
			}
		});


		var cache = {};
		let user_cache = {};

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

			cache.playlist_tracks_map = {};
			cache.user_playlist_map_full = {};
			cache.user_playlist_map_simple = {};
		};
		clean_cache(cache);

		exports.clean_cache = clean_cache;

		exports.set_user_cache = function(user,cache){
			user_cache[user.id] = cache;
			console.log(user_cache);
		};

		//spotify api doesn't seem to care if I fuck up these url formations:
		//https://api.spotify.com/v1/users/dacandyman01/playlists?&offset=150&limit=50
		//gets parsed as
		//https://api.spotify.com/v1/users/dacandyman01/playlists?offset=150&limit=50

		var url_users = "https://api.spotify.com/v1/users";
		var off = "&offset=";
		var lim = "&limit="
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
		var make_request =  function(url_object,cache){

			return new Promise(function(done, fail) {

				var url = url_object.url + "?" + url_object.fields + off + url_object.offset + lim + url_object.limit;

				console.log("sending request",url);

				let params = getHashParams();
				global_access_token = params.access_token

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
				global_access_token = params.access_token
				console.log("sending request", req.url);

				let call = () =>{
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
				};
				if(sleep){
					console.log("sleeping",sleep)
					setTimeout(() =>{call()},sleep)
				}
				else{call()}
			})
		}; //make_request_simple


		/**
		 * Hit a search endpoint to try and resolve an input string to an artist profile in Spotify
		 * @function search_artists
		 **/
		exports.search_artists  = function(query){

			console.log("search_artists");

			return new Promise(function(done, fail) {

				var req = {};
				// req.token = token;
				req.token = global_access_token

				//todo: test query
				//todo: convert query with spaces into %20
				query = "kamasi%20Washington";
				console.warn("FORCING QUERY: ",query);
				req.url = "https://api.spotify.com/v1/search?q=" + query + "&type=artist";

				console.log(global_access_token);
				make_request_simple(req,cache.dummy).then(function(result){
					console.log("result:",result);

					//todo: assuming first match is always the one we want
					var artist = {};
					result.artists ? artist =  result.artists[0] : {};
					done(artist)

				})

			})
		};


		/**Get tracks for every playlist you throw at it {playlist_tracks_map}
		 * While processing the playlist track entries, it also fills out artistsInfoMap, artistsInfoMap_simple
		 * Called while iterating over playlists from get_all_tracks
		 *
		 * @function playlist_tracks
		 **/

		var playlist_finished_count = 0;
		exports.playlist_tracks = function(user,playlist){

			return new Promise(function(done, fail) {

				//user = "dacandyman01"
				//playlist.id = "/5qdfEl1ylx7MLZTmJXydSJ"

				//var url_example = "https://api.spotify.com/v1/users/dacandyman01/playlists/5qdfEl1ylx7MLZTmJXydSJ/tracks?fields=items.track.artists&limit=50&offset=0"

				user = "/" + user
				var url1 = "/playlists";
				var url2 = "/tracks";

				var url_object = {};
				url_object.url =  url_users + user + url1 + "/" + playlist.id + url2
				url_object.offset = 0;
				url_object.limit = 50;
				url_object.fields = "fields=items.track.artists";

				console.log('fetching playlist_tracks for : ' + playlist.id );

				//todo: cache'ing a single playlist's tracks isn't particularly useful right now...
				// and we're only using this to get artists out anyways, so cache is dummy

				//todo: should I be clearing cache here?

				cache.dummy = [];
				make_request(url_object,cache.dummy)
					.then(function(data){

						cache.playlist_tracks_map[playlist.id] = data;

						//var do_track = false;
						let artist_list = [];
						let skip = 0;

						data.forEach(function(ob){
							ob.track.artists.forEach(function(artist){
								if(artist_list.indexOf(artist.id) !== -1){skip++;}

								else {
									//do_track = true;
									artist_list.push(artist.id);
								}
							}); ///track artists
						}); //data

						console.log("$skipped",skip);
						let payloads = [];
						let custom_it = 0;
						let payload = [];

						artist_list.forEach(function(id,i){

							if(i === 0){payload.push(id)}
							else{
								//everytime we hit a multiple of 50, create a new payload
								if(!(i % 50 === 0)){payload.push(id)}
								else{
									console.log("archive & reset payload");
									payloads.push(payload);
									custom_it = 0;
									payload = [];
								}
							}
						});

						//leftover
						if(payload.length){payloads.push(payload)}
						console.log("$payloads",payloads);

						//declare outside of iterator
						// var promiseTrack = new Promise(function(resolved) {
						// 	resolved();
						// });
						//let do_track;

						let promises = []
						payloads.forEach(function(payload){

							//do_track = true;
							//form a comma seperated list of 50 artists ids
							let payload_str  = "";
							payload.forEach(function(id,i){
								payload_str = payload_str + id;
								i !== payload.length - 1 ? payload_str =  payload_str + "," :{}});

							var url = "https://api.spotify.com/v1/artists?ids=";
							var url_object = {};
							url_object.url = url  + payload_str;
							url_object.fields = "";

							promises.push(make_request_simple(url_object, cache.dummy,100));

							// var reqSleep =  function(){
							//     return new Promise(function(done, fail) {
							// 	    make_request_simple(url_object, cache.artistsInfoMap)
							// 		    .then(sleeper(50))
							// 		    .then( () =>{done()})
							//     })
							// };
							// promises.push(reqSleep);
						});

						// exports.artists_multi = function(){

						Promise.all(promises).then(function(results){
							//console.log("$results",results);

							let all_artists = [];
							results.forEach((r)=>{all_artists = all_artists.concat(r.artists)});

							console.log(all_artists);
							console.log("$artists fetched total",all_artists.length);

							all_artists.forEach(function(ar){
								//guess we had a null one time?
								let simp;
								if(ar){
									cache.artistsInfoMap[ar.id] = ar;
									simp = {};simp.display_name = ar.name; simp.id = ar.id;
									cache.artistsInfoMap_simple[ar.id] = simp;

									ar.genres.forEach((g)=>{
										if(cache.genres.indexOf(g) === -1){
											cache.genres.push(g);
										}
									});

									//will certainly create duplicate artist entry/overlap which is the point
									ar.genres.forEach((g)=>{
										if(!cache.genres_artist_map[g]){
											cache.genres_artist_map[g] = [];
											cache.genres_artist_map[g].push(simp);
										}else{
											cache.genres_artist_map[g].push(simp);
										}
									})
								}//non null artist
							});

							// console.log("artistsInfoMap",cache.artistsInfoMap);
							// console.log("artistsInfoMap_simple",cache.artistsInfoMap_simple);
							//
							// console.log("genres",cache.genres);
							// console.log("genres_artist_map",cache.genres_artist_map);
							done();
						})

						// promiseTrack.then(function(results) {
						//
						// 	console.log("$results",results);
						// 	console.log(cache.artistsInfoMap);
						// 	//cache.playlist_tracks_map[playlist.id] = data;
						//
						// 	// playlist_finished_count++;
						// 	// console.log(playlist_finished_count + " :: playlist_tracks finished with length: ",data.length);
						// 	//
						// 	// console.log("current cache.artistsInfoMap size: ");
						// 	// console.log(count_properties(cache.artistsInfoMap));
						// 	//done(data);
						// });


						// }else{
						// 	playlist_finished_count++;
						// 	console.log(playlist_finished_count + " :: playlist_tracks finished with length: ",data.length);
						// 	done(data)
						// }
						// if(do_track){
						// 	promiseTrack.then(function(results) {
						//
						// 		console.log("$results",results);
						// 		// cache.playlist_tracks_map[playlist.id] = data;
						// 		//
						// 		// playlist_finished_count++;
						// 		// console.log(playlist_finished_count + " :: playlist_tracks finished with length: ",data.length);
						// 		//
						// 		// console.log("current cache.artistsInfoMap size: ");
						// 		// console.log(count_properties(cache.artistsInfoMap));
						// 		done(data);
						// 	})
						// }else{
						// 	console.log("$here");
						// 	playlist_finished_count++;
						// 	console.log(playlist_finished_count + " :: playlist_tracks finished with length: ",data.length);
						// 	done(data)
						// }
					})
			})//promise

		};//playlist_tracks


		/** run thru the cache.playlists, calling playlist_tracks for each
		 *  at the end, as a result of playlist_track's work, we have
		 *  a cache of interesting data which we preserve in a user cache and clear it.
		 *
		 *
		 * @function get_all_tracks
		 **/
		exports.get_all_tracks = function(user){
			console.log("user",user);

			var promiseTrack = new Promise(function(resolved) {
				console.log("get_all_tracks...");
				resolved();
			});


			console.log("getting tracks for " + cache.playlists.simple.length + " playlists..." );

			cache.playlists.simple.forEach(function(playlist_simple) {

				promiseTrack = promiseTrack.then(function() {
					return (
						exports.playlist_tracks(user.id,playlist_simple)
							//.then(sleeper(200))
					)
				});
			});

			promiseTrack.then(function(results) {

				//results will be the last result of the exports.playlist_tracks() promise chain
				//i.e. its not super useful. instead we've been maintaining a map of every playlist's track
				//which is updated every time a playlist request is exhausted

				console.log("============================================================");
				console.log("get_all_tracks promise chain finished");


				// console.log("cache.playlist_tracks_map",cache.playlist_tracks_map);
				// console.log(Object.keys(cache.playlist_tracks_map).length);
				// console.log("cache.artistsInfoMap",cache.artistsInfoMap);
				// console.log(Object.keys(cache.artistsInfoMap).length);

				//extract all tracks from playlist

				for (let playlistID in cache.playlist_tracks_map) {
					if (cache.playlist_tracks_map.hasOwnProperty(playlistID)) {
						cache.playlist_tracks_map[playlistID].forEach(function(track){
							cache.tracks.push(track)
						});
					}
				}

				// console.log("cache.tracks:",cache.tracks);
				// console.log("cache.genres",cache.genres);
				// console.log("genres_artist_map",cache.genres_artist_map);

				//reorder genres
				cache.genres = cache.genres.sort();

				//push all unique artists

				cache.tracks.forEach(function(track){
					track.track.artists.forEach(function(artist){
						var art = {}; art.id = artist.id; art.name = artist.name;

						//this is handled in playlist_tracks now

						// if(cache.artistsInfoMap[art.id]){
						// 	if(cache.artistsInfoMap[art.id].genres){
						// 		art.genres = cache.artistsInfoMap[art.id].genres;
						// 	}
						// }

						if(findWithAttr(cache.artists.full,"id",art.id) === -1){
							cache.artists.full.push(art);
							var tuple = {};
							tuple.name = art.name;
							tuple.genres = art.genres;
							cache.artists.simple.push(tuple);
						}
					})
				});

				//console.log("unique artists in cache.artists.simple:",cache.artists.simple);

				user_cache[user.id] = JSON.parse(JSON.stringify(cache));
				console.log(user_cache[user.id]);
				exports.clean_cache(cache)

			})
				.catch(function(err){
					console.log("promiseTrack err: ",err);
				});
		};


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
		 * load my playlists into cache.playlists.simple, cache.playlists.full, and
		 * mapped by user into cache.playlists.userMap
		 * @function user_playlists
		 **/
		exports.get_user_playlists = function(user){
			var url1 = "/playlists";

			//var url_example = "https://api.spotify.com/v1/users/dacandyman01/playlists?offset=0&limit=50"
			//var test_console = "https://beta.developer.spotify.com/console/get-playlists/?user_id=wizzler&limit=&offset=";

			var url_object = {};
			url_object.url =  url_users + "/" + user.id + url1;
			url_object.offset = 0;
			url_object.limit = 50;
			url_object.fields = "";

			make_request(url_object,cache.playlists.full)
				.then(function(data){
					//data = cache.playlists.full

					console.log("user_playlists finished with records length: ",cache.playlists.full.length);
					console.log("data: ",cache.playlists.full);

					cache.playlists.simple = data.map(function(item,index) {
							var rObj = {}; rObj.id = item.id; rObj.name = item.name;
							return rObj;
						}
					);

					//todo: sometimes owner.id is NOT string, but instead the ### representation

					//populating map with keys = many spotify user ids
					cache.playlists.full.forEach(function(list){
						if(cache.user_playlist_map_full[list.owner.id] === undefined){
							cache.user_playlist_map_full[list.owner.id] = [];
						}
						cache.user_playlist_map_full[list.owner.id].push(list)
					});

					//mapping over to simple requires iterating thru props of mapping
					for (var id in cache.user_playlist_map_full) {
						if (cache.user_playlist_map_full.hasOwnProperty(id)) {
							cache.user_playlist_map_simple[id] = cache.user_playlist_map_full[id].map(function(item,index) {
									var rObj = {}; rObj.id = item.id; rObj.name = item.name;
									return rObj;
								}
							)
						}
					}

					//todo:
					//console.log("playlists.simple cache updated:",cache.playlists.simple);
					console.log("get_user_playlists finished.");
					console.log("cache.playlists.full",cache.playlists.full);
					console.log("cache.playlists.simple",cache.playlists.simple);
					console.log("---------------------------------------------------");
					console.log("cache.user_playlist_map_full",cache.user_playlist_map_full);
					console.log("cache.user_playlist_map_simple",cache.user_playlist_map_simple);
				})

		};//user_playlists


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
