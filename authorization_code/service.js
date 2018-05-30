

var cache = {};
cache.dummy = [];
cache.artists = {};
cache.playlists = {};

cache.artists.simple = [];
cache.artists.full = [];

cache.artistsInfoMap = {};


cache.playlists.simple  = [];
cache.playlists.full = [];

cache.tracks = [];

cache.playlist_tracks_map = {};
cache.user_playlist_map_full = {}
cache.user_playlist_map_simple = {}

/**
 * //todo: needs to be generatlized
 * Designed for one-off requests
 * Only reads the URL from the url_object
 * prevents duplicate data from being MAPPED to cache
 * doesn't care if we fail, still calls done
 * @function make_request
 **/
var make_request_simple =  function(req,cache){

	return new Promise(function(done, fail) {

		var url = req.url;

		console.log("sending request",url);

		$.ajax({
			dataType: 'json',
			beforeSend: function (request) {
				request.setRequestHeader("Authorization", 'Bearer ' + req.token);
				//var temp_token = "BQClTYekdyT4Fyt3yXsEv6BUfzSly9ihQm1FI6NusqXxeefaxaT0mAuCDL1efdF2HzZKKYqzJw1bMlDQwS9pUZqdZ4ysTDy5oVpCefsNv-O5_9KiYW87lpEZXNRKRQ_YqRKHuuf3RnlTArsBMCuZfU3B6w"
				//request.setRequestHeader("Authorization", 'Bearer ' + temp_token );
			},
			url: url,
		}).done(function(payload){

			console.log("retrieved: ",payload);

			// cache.push(payload)
			cache[payload.id] = payload;
			done(cache);

		})
			.fail(function(err){

				console.log("there was a problem: ");
				console.log(err);
				done(cache)
			})
	})

}; //make_request_simple


exports.search_artists  = function(token){

	    console.log("search_artists");

	    return new Promise(function(done, fail) {

	    	var req = {};
	    	req.token = token;
	    	req.url = "https://api.spotify.com/v1/search?q=kamasi%20Washington&type=artist";
		    make_request_simple(req).then(function(result){

			    console.log("result:",result);
			    done(result)

		    })

	    })
};

