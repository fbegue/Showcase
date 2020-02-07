var SpotifyWebApi = require('spotify-web-api-node'); // Express web server framework

let all_scopes =["playlist-read-private", "playlist-modify-private", "playlist-modify-public", "playlist-read-collaborative", "user-modify-playback-state", "user-read-currently-playing", "user-read-playback-state", "user-top-read", "user-read-recently-played", "app-remote-control", "streaming", "user-read-birthdate", "user-read-email", "user-read-private", "user-follow-read", "user-follow-modify", "user-library-modify", "user-library-read"];

var clientSecret = '1c09323e0aad42cfaef5f23bb08b6428';

var scopes = all_scopes,
	redirectUri = 'http://localhost:8888/callback',
	clientId = '178a441343904c588cef9acf8165a5d4',
	//todo:
	state = 'some-state-of-my-choice';

// var spotifyApi = new SpotifyWebApi({
// 	redirectUri: redirectUri,
// 	clientId: clientId
// });
//
// var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
// console.log(authorizeURL);

//code retrieved when redirect URL is hit
//todo: but of course this won't work b/c its not fresh?
//how am i supposed to get this code to use?

//var code = "AQD2iaFG76V-VEbJX-QaMeMiaIpw33iIrCrHSz95Pac2lXeprDnDUf3nTwjZPa1e5Q0UlG0NFX229Ly66T0Y5Q1rISE8uVGIqeUQoH3U6UAah7J79J0gtpZkdWOyoEpPrf9UBZz5BQq53H9lY0uwOzGZjlxj1d_492YMb-szXri0BKwcKDUUWWUSjc4ggKb78YKDeYzEpVc82jDwSJHILO-tUeg9T88ySqpYJhuOi8ObVyOrF9DZyrqAsQJy_wNTsO3LRtlJkYm2zK8XkFXriZu_H434ZzoP9abe3ETVUDP84zy2JywuOZ0HZf8vwPdsgIlL6OE-hbdK6YVpp-kYq2S0Io4H7dfDcsLyvojZDDJ0r4ZiyF48vWly3nNL0u81_myExgzVvryWP98O2fTeXEeNkrB6vl2wdp2NzzmUxvvEDgPDchGty7t4n4oYyW6-d0bmMFxiJDS03qiwtywhOtu-0qUKD7ViH4inhxpgwkuo2N6Hk4-zjWl6jlst3R9RD2kj9Pzmzgj9QSTOpjRVVU1FnX5SoRQGQDLDqpIV9i0rB29GJE9BC0DzZ_MQusC-FKN1odMLcAFcd0MKx5pMkpey21NgYOz0czxTVmITkBzK2Xh0ZrCKRvboq7YFccumDucpaojErLxQGxlX1TKyq1DSq05mYcXAnHc1G-9aHABeRe-8I43WZ4LKeDGymedRgBgY1d4aygOI0yJj";

// var rp = require('request-promise');
//
// var getCode =  function(authorizeURL){
// 	return new Promise(function(done, fail) {
// 		let options = {
// 			method:"GET",
// 			uri: authorizeURL,
// 		};
// 		rp(options).then(function(res){
// 			console.log("authorizeURL res",res);
// 		}).catch(function(err){
// 			console.log(err);
// 		})
// 	})
// };
//
// getCode(authorizeURL)
// 	.then(function(res){
// 	console.log("authorizeURL res",res)})
// 	.catch(function(err){
// 		console.log(err);
// 	});


// var credentials = {
// 	clientId: clientId,
// 	clientSecret: clientSecret,
// 	redirectUri: redirectUri
// };
//
// var spotifyApi = new SpotifyWebApi(credentials);
//
// // Retrieve an access token and a refresh token
// spotifyApi.authorizationCodeGrant(code).then(
// 	function(data) {
// 		console.log('The token expires in ' + data.body['expires_in']);
// 		console.log('The access token is ' + data.body['access_token']);
// 		console.log('The refresh token is ' + data.body['refresh_token']);
//
// 		// Set the access token on the API object to use it in later calls
// 		spotifyApi.setAccessToken(data.body['access_token']);
// 		spotifyApi.setRefreshToken(data.body['refresh_token']);
//
// 		// spotifyApi.getUserPlaylists('dacandyman01')
// 		// 	.then(function(data) {
// 		// 		console.log('Retrieved playlists', data.body);
// 		// 	},function(err) {
// 		// 		console.log('Something went wrong!', err);
// 		// 	});
//
// 	},
// 	function(err) {
// 		console.log('Something went wrong!', err);
// 	}
// );


//========================================
//Client Credential flow

var spotifyApi = new SpotifyWebApi({
	clientId: clientId,
	clientSecret: clientSecret,
	redirectUri: redirectUri
});


var token = "BQC1pPB_qb5525R39w_zow9oCAU0_YLeBMuJUpKbmBvukja7bxO2XiFN1RXq8Sd7Q7wlog04WQNZJK-DDmAFry7c89GEK-5mgU6jxuLgH-pugcgS8yqDDwilhaaodjvH6iOTgsqK9xm3R93bwC8uNrHQ-qqOAROGql_iyEPZUmUNJt_054IDh7tnJIQsFeObqwLKOX2EF_792oIdLgO45TPFcnbyAucwqeMfVlTH5_cxX4KK3kiNt_oPELeRSbyCZ24YpU0hACUymz34QW_8JB-_LBM"
spotifyApi.setAccessToken(token);

//todo: easier way to expose these?

module.exports.getUserPlaylists = function(){
    return new Promise(function(done, fail) {
	    spotifyApi.getUserPlaylists('dacandyman01')
		    .then(function(data) {
			    console.log('Retrieved playlists', data.body);
			    done(data.body)
		    },function(err) {
			    console.log('Something went wrong!', err);
		    });
    })
}


// spotifyApi.createPlaylist('spot_test1', { 'public' : false })
// 	.then(function(data) {
// 		console.log('Created playlist!');
// 	}, function(err) {
// 		console.log('Something went wrong!', err);
// 	});