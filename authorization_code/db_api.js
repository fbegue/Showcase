const sApi = require('./spotify_api');
var rp = require('request-promise');
let sql = require("mssql");
var _ = require('lodash');
var app =  require('./app')

module.exports.checkDb = function(){
	var sreq = new sql.Request(sApi.poolGlobal);
	sreq.query("select getdate();")
		.then(function(res){
			console.log("#res",res);

		})
};

//the utilized SP checkForArtistGenres can handle both types of artist ids
//expects artist.ids
var checkDBForArtist;
//this does a 0 check against genres, and if it doens't find any, you don't get any records back
//so not really the best named function..

module.exports.checkDBForArtist = checkDBForArtist = function(artist){
	return new Promise(function(done, fail) {

		//console.log("in",artist.id);
		//console.log("qry",qry);
		var sreq = new sql.Request(sApi.poolGlobal);
		var sres = {payload:[],db:[],lastLook:[]};

		sreq.input("artistId", sql.VarChar(50), artist.id);
		sreq.execute("checkForArtistGenres").then(function(res){
			if(res.recordset.length > 0){
				//console.log(res.recordset);
				//we're fetching artist join on genres.

				//if lastLook isnt but there IS a record populated,
				// we recorded a failure at some point in the past, skip this
				//todo: make this a time-sensitive expiration (when we have more than 1 service to feed from)

				if(res.recordset[0].lastLook !== null){
					var oneNull =res.recordset[0];
					console.log("",oneNull.displayName + " lastLook: " + oneNull.lastLook);
					sres.lastLook.push(artist)
				}
					//if there's only 1 row and the genres null, we have a record but no genres
					//and have never attempted to
					//todo: at what point would I be recording an artist without making this attempt tho?
					// else if(res.recordset.length === 1 && res.recordset[0].genreName === null){
					// 	sres.payload.push(artist)
					// }
					//
				//we have genres. record them in the return cache
				else{
					artist.genres = [];
					res.recordset.forEach(function(match){
						artist.genres.push({id:match.genre_id,name:match.genre_name})
					});

					//these were genre-joins, so pick any record for artist info
					artist.name = res.recordset[0].displayName || res.recordset[0].name
					artist.identifier = res.recordset[0].identifier;
					artist.id = res.recordset[0].id;
					sres.db.push(artist)
				}
			}
			//we've never seen this id before
			else{
				//console.log("push");
				sres.payload.push(artist)
			}
			done(sres);
		}).catch(function(err){
			console.error("checkDBForArtist failure",err);
			fail(err)
		})
	})
};

//this should be able to handle both spotify and songkick artists
//todo: when I do songkick later make sure to follow the playob convention

module.exports.checkDBForArtistGenres =  function(playob,key){
	return new Promise(function(done, fail) {
		var artists = playob[key];
		var songkickIds = true;
		typeof artists[0].id == "string" ? songkickIds = false:{};
		console.log("process set of " + (songkickIds ? "songkickIds":"spotifyIds"));

		var promises = [];

		//console.log(artists[0]);
		artists.forEach(function(a){
			promises.push(checkDBForArtist(a))
			//a.id == "0qzzGu8qpbXYpzgV52wOFT" ? console.log(a):{};
			//a.id == "18H0sAptzdwid08XGg1Lcj" ? console.log(a):{};
		});

		Promise.all(promises).then(results => {
			//todo: accidentally set this up checkDBForArtist to do many artists
			//so weird aggregation here

			console.log("$results",app.jstr(results));
			//todo: this is also just a weird place to be defining what a playob is, right?

			if(key == 'spotifyArtists'){
				console.log("set spotifyArtistsResolved");
				playob.spotifyArtistsResolved = results;
			}
			else{
				var agg = {payload:[],db:[],lastLook:[]}
				results.forEach(function(r){
					agg.payload = agg.payload.concat(r.payload)
					agg.db = agg.db.concat(r.db)
					agg.lastLook =  agg.lastLook.concat(r.lastLook)
				});
				Object.assign(playob,agg);
			}
			done(playob);

		}).catch(err =>{
			console.error(err);
			fail(err);
		})
	})
};

/**
 * commitPlayobs
 * commit the newly spotify-sourced artists into the database
 * in the process, create new / retrieve genre-id pairs for the genres
 * */

//feature: currently always returns with nothing
//the idea being that the db will have everything we need
module.exports.commitPlayobs =  function(playobs) {
	return new Promise(function (done, fail) {

		//submit genres, annotating the incoming object with ids created or fetched
		//insert artists and genre_artist relations

		var gpromises = [];
		var unique = []
		var skipped = 0;
		playobs.forEach(function (p) {
			//since even  we send playobs with only db fetched artists here as well
			//just make them fail fast since they won't have this spotifyArtists field
			//but throw this value on here for easy aggregation later
			if (!p.spotifyArtists) {
				p.spotifyArtists = [];
				skipped++
			}
			p.spotifyArtists.forEach(function (a) {
				a.genres.forEach(g => {
					//todo: pretty sure theres a timing issue here causing me to register some
					//exact same value genres twice. so just going to prune for uniqueness here
					if (unique.indexOf(g) === -1) {
						gpromises.push(insert_genre(g));
						unique.push(g)
					}
				})
			})
			Promise.all(gpromises).then(r => {
					//console.log("$r",app.jstr(r));

					//mutate playobs with qualified genres
				   if(r.length){

					var genres = r.reduce(function (prev, curr) {
						return prev.concat(curr);
					});
					var map = {};
					genres.forEach(g => {
						map[g.name] = g;
					});

					playobs.forEach(function (p) {
						var apromises = [];
						p.spotifyArtists.forEach(function (a) {
							var gs = [];
							a.genres.forEach(g => {
								gs.push(map[g])
							})
							a.genres = gs;

							//push artists and artist_genres
							apromises.push(insert_artist(a));
							a.genres.forEach(function (g) {
								var ag = {genre_id: g.id, id: a.id}
								apromises.push(insert_genre_artist(ag));
							});
						})
						Promise.all(apromises).then(function (r2) {
							console.log("insert genres, artists and artist_genres finished");
							console.log("skipped:", skipped);
							//feature: here I could save some time by returning these and preventing
							//the final checkDBForArtistGenres from checking for them, but keep it simple for now
							done();
						})
					});

				   }//if r
				else{
					   console.log("no spotifyArtists to commit in any playob");
					   done();
				   }
				},
				e => {
				})
		})
	})
}

//incoming object looks like:
// {
// 	id: '1xD85sp0kecIVuMwUHShxs',
// 	name: 'Twin Peaks',
// 	artistSongkick_id: 296530,
// 	displayName: 'Twin Peaks',
// 	genres: []
// 	}

//made genres optional for use of this after checking spotify
//todo: maaaybe getting too messy due to lazyness

module.exports.commit_artistSongkick_with_match =   function(songkickOb) {
	return new Promise(function (done, fail) {
		//console.log("$artist", songkickOb);

		var artistSongkick = {id: songkickOb.artistSongkick_id, displayName: songkickOb.displayName};
		var artist_artistSongkick = {artist_id: songkickOb.id, artistSongkick_id: songkickOb.artistSongkick_id};

		async function commit() {
			//todo: confused whether this is necessary always here?
			await insert_artistSongkick(artistSongkick);
			await insert_artist_artistSongkick(artist_artistSongkick);

			//these requests come from spotify->songkick string matching successes
			//even if there were no genres pulled, we will still record newly exposed spotify artist
			//as we need to to make the above connection valid anyways
			if(songkickOb.newSpotifyArtist){
				//var newSpot = {id:songkickOb.newSpotifyArtist.id, name:songkickOb.newSpotifyArtist.name,uri:songkickOb.newSpotifyArtist.uri}
				await insert_artist(songkickOb.newSpotifyArtist);

				//todo: how does await work here?

				//these are artist-artistSongkick matches
				//we will store the genres obtained from the successful spotify lookup if it got any
				if (songkickOb.genres.length > 0) {
					var gpromises = [];
					var apromises = [];

					songkickOb.genres.forEach(g => {
						gpromises.push(insert_genre(g))
					});
					Promise.all(gpromises).then(r => {
						//console.log("1===========");
						//console.log(r);
						var genres = r.reduce(function(prev, curr) { return prev.concat(curr); });
						//console.log(genres);
						genres.forEach(g => {
							var ag = {genre_id: g.id, id: songkickOb.id}
							apromises.push(insert_genre_artist(ag));
						});

						//await Promise.all(apromises)
						Promise.all(apromises).then(r => {
							//console.log("2===========");
							//console.log(r);
							return r;

						}, e => {console.log(e);})
					}, e => {console.log(e);})
				}//genres.length

			}
		}

		commit().then(r => {
			//console.log("3===========");
			//console.log(r);
			done(r);
		}, e => {
			console.error(e);
		})
	})};


//todo: arbitrary limit here not sure what to do with this yet
const levenMatchLimit = 5;

//attempt to establish a new link between a spotify and songkick artist purely based on the provided names
//will attempt to return with genres from spotify but NOT songkick because we already checked on that in
//checkDBFor_artistSongkick_match

module.exports.checkDBForArtistLevenMatch =  function(artist){
	return new Promise(function(done, fail) {
		// console.log("$artist",artist);

		var sreq = new sql.Request(sApi.poolGlobal);
		//var sres = {payload:[],db:[],lastLook:[]};

		sreq.input("name", sql.VarChar(50), artist.name);
		sreq.input("id", sql.Int, artist.id);
		sreq.execute("levenMatch").then(function(res){
			var r0 = res.recordset[0];
			//var ret = {id:r.id,name:r.name,artistSongkick_id:r.artistSongkick_id,displayName:r.displayName,genres:[]}
			var ret = Object.assign({}, artist);
			ret.genres = [];

			//they are sorted by levenMatch so index [0] will be the best we can do
			if(res.recordset.length > 0 && r0.levenMatch !== null && r0.levenMatch < levenMatchLimit) {
				//console.log(res.recordset);
				res.recordset.forEach(rec => {
					ret.genres.push({id:rec.genre_id,name:rec.genre_name})
				})
			}
			//todo: just fail it and catch in a reflect?
			else{
				Object.assign({error:"no good match"},ret);
			}
			done(ret)
		}).catch(err =>{
			//console.error(err);
			fail(err);
		})
	})
};

//note this goes to see if we can find an artist_artistSongkick match using only the artistSongkick_id supplied
//if it finds a match, it will attempt to join on spotify OR songkick's known genres
module.exports.checkDBFor_artist_artistSongkick_match =  function(artist){
	return new Promise(function(done, fail) {

		//console.log("$artist",artist);
		var sreq = new sql.Request(sApi.poolGlobal);

		sreq.input("artistSongkick_id", sql.Int, artist.id);
		//console.log(sreq.parameters);
		sreq.execute("match_artist_artistSongkick")
			.then(r => {
				//console.log("$r",r.recordset);
				var ret = Object.assign({}, artist);
				ret.genres = [];
				if(r.recordset.length > 0) {
					r.recordset.forEach(rec => {
						ret.genres.push({id:rec.genre_id,name:rec.genre_name})
					})
				}
				//console.log(ret);
				done(ret);
			}).catch(err =>{
			//console.error(err);
			fail(err);
		})
	})
};

//todo: just a shell rn
//just check for already known genres associated with a songkick object
module.exports.checkDBFor_artistSongkick_match =  function(artist){
	return new Promise(function(done, fail) {

		//console.log("$artist",artist);
		var sreq = new sql.Request(sApi.poolGlobal);

		sreq.input("artistSongkick_id", sql.Int, artist.id);
		//console.log(sreq.parameters);
		sreq.execute("match_artistSongkick")
			.then(r => {
				//console.log("$r",r.recordset);
				var ret = Object.assign({}, artist);
				ret.genres = [];
				if(r.recordset.length > 0) {
					r.recordset.forEach(rec => {
						ret.genres.push({id:rec.genre_id,name:rec.genre_name})
					})
				}
				console.log(ret);
				done(ret);
			}).catch(err =>{
			//console.error(err);
			fail(err);
		})
	})
};


var insert_genre = function (genre) {
	return new Promise(function (done, fail) {
		var sreq = new sql.Request(sApi.poolGlobal);
		var qry = "IF NOT EXISTS (SELECT * FROM dbo.genres WHERE name = @name) " +
			"INSERT INTO dbo.genres(name) OUTPUT inserted.id, inserted.name VALUES(@name) " +
			"else select * from dbo.genres WHERE name = @name";
		sreq.input("name", sql.VarChar(255), genre);
		sreq.query(qry).then(function (res) {
			done(res.recordset);
		}).catch(function (err) {
			console.log(err);
			fail(err);
		})
	})
};

var insert_artist =  function(artist){
	return new Promise(function(done, fail) {

		//console.log("$$artist",app.jstr(artist));

		var del = ["external_urls","href","genres","type"]
		var a = Object.assign({},artist);
		del.forEach(p =>{	delete a[p]});


		//todo: make this string json for now
		a.images = JSON.stringify(a.images);
		//parsing followers to int (also has a null href?)
		a.followers = a.followers.total || null;
		//a.popularity = a.popularity;

		var keys = Object.keys(a);
		var klist = keys.map(function(value){
			return "" + value + ""
		}).join(",");
		var kparams = keys.map(function(value){
			return "@" + value + ""
		}).join(",");

		var sreq = new sql.Request(sApi.poolGlobal);
		sreq.input("id",  sql.VarChar(50), a.id);
		sreq.input("name", sql.VarChar(50), a.name);
		sreq.input("images", sql.VarChar(), a.images);
		sreq.input("followers", sql.Int, a.followers);
		sreq.input("popularity", sql.Int, a.popularity);
		sreq.input("uri", sql.VarChar(100), a.uri);

		var qry = "IF NOT EXISTS (SELECT * FROM dbo.artists WHERE id = @id)"
			+ " INSERT INTO dbo.artists("+ klist + ")"
			+ " OUTPUT inserted.id, inserted.name, inserted.images, inserted.followers, inserted.popularity, inserted.uri"
			+ " VALUES(" + kparams +")"
			+ " else select * from dbo.artists WHERE id = @id";

		sreq.query(qry).then(function(res){
			//we already have ids
			//even if we didn't know about the artist, nothing to return here
			//console.log(res);
			done();
		}).catch(function(err){
			console.log(err);
		})
	})
}


//todo: setup to handle both songkick and spotify
//they look like: {genre_id:#,artist_id:"",artistSongkick_id}
//so whatever's not present is what to submit i.e. up to function that calls this to set that up

let insert_genre_artist = function (genreArtist) {
	var klist = "genre_id,artist_id";
	var kparams = "@genre_id,@artist_id";

	var sreq = new sql.Request(sApi.poolGlobal);
	sreq.input("genre_id", sql.Int, genreArtist.genre_id);
	sreq.input("artist_id", sql.VarChar(50), genreArtist.id);
	//sreq.input("artistSongkick_id", sql.Int(), artist.id);

	var qry = "IF NOT EXISTS (SELECT * FROM dbo.genre_artist WHERE genre_id = @genre_id and artist_id = @artist_id)"
		+ " INSERT INTO dbo.genre_artist(" + klist + " )"
		+ " OUTPUT inserted.genre_id, inserted.artist_id"
		+ " VALUES(" + kparams + ")"
		+ " else select * from dbo.genre_artist WHERE genre_id = @genre_id and artist_id = @artist_id";

	sreq.query(qry).then(function (res) {
		//console.log(res);
	}).catch(function (err) {
		console.log(err);
	})
};

var insert_artistSongkick =  function(artistSongkick){
	return new Promise(function(done, fail) {

		//let a = {id:4,displayName:"testDisplayName",identifier:"test-mbei-233r-asfsdf-dfdsasfd"};

		var keys = Object.keys(artistSongkick);
		var klist = keys.map(function(value){
			return "" + value + ""
		}).join(",");
		var kparams = keys.map(function(value){
			return "@" + value + ""
		}).join(",");

		var sreq = new sql.Request(sApi.poolGlobal);
		sreq.input("id", sql.Int, artistSongkick.id);
		sreq.input("displayName", sql.VarChar(100), artistSongkick.displayName);

		//todo: sreq.input("identifier", sql.VarChar(150), a.identifier);
		//todo: sreq.input("onTourUntil", sql.DateTimeOffset(7), as.onTourUntil)

		var qry = "IF NOT EXISTS (SELECT * FROM dbo.artistsSongkick WHERE id = @id)"
			+ " INSERT INTO dbo.artistsSongkick("+ klist + ")"
			+ " OUTPUT inserted.id, inserted.displayName, inserted.identifier"
			+ " VALUES(" + kparams +")"
			+ " else select * from dbo.artistsSongkick WHERE id = @id";

		sreq.query(qry).then(function(res){
			//console.log(res);
			done(res);
		}).catch(function(err){
			console.log(err);
		})
	})
}

var insert_artist_artistSongkick =  function(artist_artistSongkick){
	return new Promise(function(done, fail) {
		var sreq = new sql.Request(sApi.poolGlobal);
		sreq.input("artist_id", sql.VarChar(150), artist_artistSongkick.artist_id);
		sreq.input("artistSongkick_id",sql.Int, artist_artistSongkick.artistSongkick_id);
		var qry2 = "insert into artist_artistSongkick(artist_id, artistSongkick_id) values (@artist_id, @artistSongkick_id)";
		sreq.query(qry2).then(function(res){
			//console.log(res);
			done(res);
		}).catch(function(err){
			console.log(err);
		})
	});
}




