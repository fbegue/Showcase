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


        /**
         * Fetch a user's top artists.
         * @function top_artists
         * For each time range, the top 50 tracks and artists are available for each user.
         * In the future, it is likely that this restriction will be relaxed.
         * This data is typically updated once each day for each user.
         *
         * todo: this seems fucked b/c I can definitely get up to offset 49 but no more (so 99)
         **/

        exports.top_artists = function(user){

            var params = getHashParams();
            global_access_token = params.access_token

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

                        // callback({
                        //     word: word,
                        //     tracks: r.tracks.items
                        //         .map(function(item) {
                        //             var ret = {
                        //                 name: item.name,
                        //                 artist: 'Unknown',
                        //                 artist_uri: '',
                        //                 album: item.album.name,
                        //                 album_uri: item.album.uri,
                        //                 cover_url: '',
                        //                 uri: item.uri
                        //             }
                        //             if (item.artists.length > 0) {
                        //                 ret.artist = item.artists[0].name;
                        //                 ret.artist_uri = item.artists[0].uri;
                        //             }
                        //             if (item.album.images.length > 0) {
                        //                 ret.cover_url = item.album.images[item.album.images.length - 1].url;
                        //             }
                        //             return ret;
                        //         })
                        // });
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




        }//top_artists


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
                    exports.pageJson(body);
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


        }

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
