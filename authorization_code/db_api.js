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
var checkDBForArtist =  function(artist){
	return new Promise(function(done, fail) {

		//console.log("in",artist.id);
		//console.log("qry",qry);
		var sreq = new sql.Request(sApi.poolGlobal);
		var sres = {payload:[],db:[],lastLook:[]};

		sreq.input("artistId", sql.VarChar(50), artist.id);
		sreq.execute("checkForArtistGenres").then(function(res){
			if(res.recordset.length > 0){

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
						artist.genres.push(match["genreName"])
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

module.exports.checkDBForArtistGenres =  function(playob){
	return new Promise(function(done, fail) {
		var artists = playob.artists;
		var songkickIds = true;
		typeof artists[0].id === "string" ? songkickIds = false:{};
		//console.log("process set of" + songkickIds?"songkickIds":"spotifyIds");

		var promises = [];

		artists.forEach(function(a){
			promises.push(checkDBForArtist(a))
		});

		Promise.all(promises).then(result => {
			//accidentally set this up checkDBForArtist to do many artists
			//so weird aggregation here

			var agg = {payload:[],db:[],lastLook:[]}
			result.forEach(function(r){
				agg.payload = agg.payload.concat(r.payload)
				agg.db = agg.db.concat(r.db)
				agg.lastLook =  agg.lastLook.concat(r.lastLook)
			});

			Object.assign(playob,agg);
			done(playob);

		}).catch(err =>{
			console.error(err);
			fail(err);
		})
	})
};

module.exports.commitPlayobs =  function(playobs){
	return new Promise(function(done, fail) {

		//submit genres, annotating the incoming object with ids created or fetched
		//insert artists and genre_artist relations

		var gpromises = [];
		var unique = []

		playobs.forEach(function(p){
			p.artists.forEach(function(a){
				a.genres.forEach(g =>{
					//todo: pretty sure theres a timing issue here causing me to register some
					//exact same value genres twice. so just going to prune for uniqueness here
					if(unique.indexOf(g) === -1){gpromises.push(insert_genre(g));unique.push(g)}
				})
			})
		});

		Promise.all(gpromises).then(r =>{
				//console.log("$r",r);

				//mutate playobs with qualified genres

				var genres = r.reduce(function(prev, curr) { return prev.concat(curr); });
				var map = {};
				genres.forEach(g => {map[g.name] = g;});

				playobs.forEach(function(p){

					var apromises = [];
					var agpromises = [];
					p.artists.forEach(function(a){

						//crucial mutation happening here: notice when we finish committing to db,
						//we finish with these playobs which now have genres on them
						var gs = [];
						a.genres.forEach(g =>{ gs.push(map[g]) })
						a.genres = gs;

						//push artists and artist_genres
						apromises.push(insert_artist(a));
						a.genres.forEach(function(g){
							var ag  = {genre_id:g.id,id:a.id}
							apromises.push(insert_genre_artist(ag));
						});
					})
					Promise.all(apromises).then(function(r2){
						console.log("insert genres, artists and artist_genres finished");
						done(playobs);
					})
					//...
				});

				//console.log(app.jstr(playobs));
			},
			e =>{})
	})
}

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

var  insert_artist=  function(artist){
	return new Promise(function(done, fail) {

		// var example = {"external_urls": {"spotify": "https://open.spotify.com/artist/1RHwcv7R6HPCPf1WMWoMbv"},
		// 	"href": "https://api.spotify.com/v1/artists/1RHwcv7R6HPCPf1WMWoMbv",
		// 	"id": "1RHwcv7R6HPCPf1WMWoMbv",
		// 	"name": "Charles Mark",
		// 	"type": "artist",
		// 	"uri": "spotify:artist:1RHwcv7R6HPCPf1WMWoMbv",
		// 	"genres": [	{"id": 23,"name": "classic sinhala pop"}]}

		//var desired = {
		// 	id:"052uQIm9OdFVUpsXaIXS7p",
		// 	name:"testName",
		// 	uri:"spotify:track:4aOy3Z4SaX3Mh1rJGh2HLz",
		// };

		var del = ["external_urls","href","genres","type"]
		var a = Object.assign({},artist);
		del.forEach(p =>{	delete a[p]});



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
		sreq.input("uri", sql.VarChar(100), a.uri);

		var qry = "IF NOT EXISTS (SELECT * FROM dbo.artists WHERE id = @id)"
			+ " INSERT INTO dbo.artists("+ klist + ")"
			+ " OUTPUT inserted.id, inserted.name, inserted.uri"
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

let insert_artistsSongkick  = function(){
	//console.log("insert_artistsSongkick");

	let a = {
		id:4,
		displayName:"testDisplayName",
		identifier:"test-mbei-233r-asfsdf-dfdsasfd",
		//onTourUntil:strDate
	};

	var keys = Object.keys(a);
	var klist = keys.map(function(value){
		return "" + value + ""
	}).join(",");
	var kparams = keys.map(function(value){
		return "@" + value + ""
	}).join(",");

	var sreq = new sql.Request(poolGlobal);
	sreq.input("id", sql.Int, a.id);
	sreq.input("displayName", sql.VarChar(100), a.displayName);
	sreq.input("identifier", sql.VarChar(150), a.identifier);

	//todo: sreq.input("onTourUntil", sql.DateTimeOffset(7), as.onTourUntil)

	var qry = "IF NOT EXISTS (SELECT * FROM dbo.artistsSongkick WHERE id = @id)"
		+ " INSERT INTO dbo.artistsSongkick("+ klist + ")"
		+ " OUTPUT inserted.id, inserted.displayName, inserted.identifier"
		+ " VALUES(" + kparams +")"
		+ " else select * from dbo.artistsSongkick WHERE id = @id";

	sreq.query(qry).then(function(res){
		console.log(res);
	}).catch(function(err){
		console.log(err);
	})

};

var insert_artist_artistSongkick = function(){
	var sreq = new sql.Request(poolGlobal);
	var qry = "select a.id as artist_id, aso.id as artistSongkick_id from dbo.artists a join dbo.artistsSongkick aso on aso.displayName = a.name";

	sreq.query(qry)
		.then(function(rlts){
			rlts.recordset.forEach(function(r){
				//console.log(r);

				var sreq2 = new sql.Request(poolGlobal);

				sreq2.input("artist_id", sql.VarChar(150), r.artist_id);
				sreq2.input("artistSongkick_id",sql.Int, r.artistSongkick_id);
				var qry2 = "insert into artist_artistSongkick(artist_id, artistSongkick_id) values (@artist_id, @artistSongkick_id)";
				sreq2.query(qry2).then(function(rlts2){
					//console.log("rlts2",rlts2);
				})
			});
		});


};




