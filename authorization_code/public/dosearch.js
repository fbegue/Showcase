/**
 * Created by begue.16 on 9/27/2017.
 */

//sourced from:

//examples:
//https://developer.spotify.com/web-api/code-examples/

//repo for playlist creator

//https://github.com/possan/playlistcreator-example/blob/master/app.js
//https://github.com/possan/playlistcreator-example/blob/master/index.html






var module = angular.module('playlistGen', [])
var controller = module.controller("myCtrl", function($scope) {
    console.log("myCtrl");
    $scope.test = "test"


})


var global_access_token = {};

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */

var getHashParams = function() {
    console.log("getHashParams");
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}


//todo: how does this work? all exports formatted like this are available to the page by default? idk

if (typeof(window) !== 'undefined') {

    (function(exports) {

    	var cache = {};
    	cache.dummy = [];
    	cache.artists = {};
    	cache.playlists = {};
    	
		cache.artists.simple = [];
		cache.artists.full = [];
		cache.playlists.simple  = [];
		cache.playlists.full = [];
		
        var url_users = "https://api.spotify.com/v1/users";
		var off = "offset=";
		var lim = "&limit="
		var offset_base = 50;
		
		var page_num = 0;
		var records = [];


		/**
		 * trying to reuse my request maker
		 * url_object:
		 * 
		 *  Even if not in use, explicitly set fields to "" b/c its used in url formation
		 * 	url_object.fields = ""
		 * 
		 * @function make_request
		 **/
		var make_request =  function(url_object,cache,callback){

			var url = url_object.url + "?" + url_object.fields + off + url_object.offset + lim + url_object.limit;
			console.log("sending request",url);

			$.ajax({
				dataType: 'json',
				beforeSend: function(request) {
					request.setRequestHeader("Authorization", 'Bearer ' + global_access_token );
					//var temp_token = "BQClTYekdyT4Fyt3yXsEv6BUfzSly9ihQm1FI6NusqXxeefaxaT0mAuCDL1efdF2HzZKKYqzJw1bMlDQwS9pUZqdZ4ysTDy5oVpCefsNv-O5_9KiYW87lpEZXNRKRQ_YqRKHuuf3RnlTArsBMCuZfU3B6w"
					//request.setRequestHeader("Authorization", 'Bearer ' + temp_token );
				},
				url:url,
				success: function(payload) {
					console.log("payload page " + page_num,payload);
					// console.log(JSON.stringify(payload,null,4));


					var results = payload["items"]
					results.forEach(function(result){cache.push(result)})

					if(results.length === 50){
						page_num++;
						url_object.offset = url_object.offset + offset_base ;

						console.log("new offset: ", url_object.offset);
						console.log("records length: ", cache.length);

						make_request(url_object,cache,callback)
					}
					else{
						console.log("finished, # of records: " + cache.length);
						console.log(cache);
						callback(cache)
					}

				},
				error: function(err) {
					console.log("there was a problem: ");
					console.log(err);
				}
			});
		};





		/**
		 *
		 * @function playlist_tracks
		 **/
		exports.playlist_tracks = function(user,playlist_id){

			//todo: haven't tested this with large playlists (over limit 50, requiring multiple trips)


			//todo: disabled hash fetching
			// var params = getHashParams();
			// global_access_token = params.access_token
			console.log(global_access_token);

			//todo: forcing me as user
			user = "/dacandyman01"
			//todo: forcing static id for testing
			playlist_id = "/5qdfEl1ylx7MLZTmJXydSJ"


			//var url_example = "https://api.spotify.com/v1/users/dacandyman01/playlists/5qdfEl1ylx7MLZTmJXydSJ/tracks?fields=items.track.artists&limit=50&offset=0"
			
			var url1 = "/playlists";
			var url2 = "/tracks";
			
			var url_object = {};
			url_object.url =  url_users + user + url1 + playlist_id + url2
			url_object.offset = 0;
			url_object.limit = 50;
			url_object.fields = "";

			console.log('fetching playlist_tracks for : ' + playlist_id );

			//todo: cache'ing a single playlist's tracks isn't particularly useful right now...
			// and we're only using this to get artists out anyways, so cache is dummy

			var results = make_request(url_object,cache.dummy,function(payload){

				//shifted this to extract artists
				
				console.log("playlist_tracks finished with length: ",cache.artists.full.length);

				cache.artists.simple = cache.artists.full.map(function(item,index) {
						var rObj = {}; rObj.id = item.id; rObj.name = item.name;
						return rObj;
					}
				)

				console.log("artists.simple cache updated:",cache.artists.simple);
			})

		};//playlist_tracks

		
		/**
		 * load a static json version of my playlists into user_playlists_simple_cache
		 * @function load_playlists
		 **/
		exports.load_playlists = function(){
			$.getJSON("my_playlists.json", function( data ) {
				var items = [];
				user_playlists_simple_cache = data.playlists;
				console.log("user_playlists_simple_cache loaded:",user_playlists_simple_cache);
			});
		};


		/**
		 * load my playlists into user_playlists_simple_cache
		 * @function user_playlists
		 **/
		exports.user_playlists = function(user){

			//todo: disabled hash fetching
			// var params = getHashParams();
			// global_access_token = params.access_token
			console.log(global_access_token);

			//todo: forcing me as user
			user = "/dacandyman01"
			var url1 = "/playlists";

			//var url_example = "https://api.spotify.com/v1/users/dacandyman01/playlists?offset=0&limit=50"

			var url_object = {};
			url_object.url =  url_users + user + url1
			url_object.offset = 0;
			url_object.limit = 50;
			url_object.fields = "";


			var results = make_request(url_object,cache.playlists.full,function(payload){

				console.log("user_playlists finished with records length: ",cache.playlists.full.length);

				// records.forEach(function(play){
				// 	var rec = {};
				// 	rec.name = play.name; rec.id = play.id;
				// 	.push(play)
				// })
				//
				cache.playlists.simple = cache.playlists.full.map(function(item,index) {
						var rObj = {}; rObj.id = item.id; rObj.name = item.name;
						return rObj;
					}
				)

				console.log("playlists.simple cache updated:",cache.playlists.simple);
			})

		};//user_playlists

		
		
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
         * Do a quick profile fetching test
         * @function testAPI
         **/
        exports.testAPI = function(){
            console.log("testAPI");

            var params = getHashParams();
            global_access_token =    params.access_token

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



        var token = "BQDJnpGvpFAnrdEH_6NK5MUCAjqRuk8qmgJa7lOYhPfUG0IW4nZY42xYm0JqOKUxr5ndcVXcoKSHoi7gRgWR2S2QDEeTenKQSHKcLzRXQc_6Kr8H_h7FTMa59CKmOF9ffg0z6To2AlIfSUVT_fJD90K9WqF4LpayiYNZbWEnbLRE4BfS4A"

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
