var $ = require('cheerio');
let sql = require("mssql")

let conn = {};
//let poolGlobal = require("./../spotify.js").poolGlobal;

const { poolPromise } = require('./../db.js')

var config = {
	"user": 'test',
	"password": 'test',
	"server": 'DESKTOP-TMB4Q31\\SQLEXPRESS',
	"database": 'master',
	"port": '61427',
	"dialect": "mssql",
};

// sql.connect(config)
// 	.then(pool => {
// 	poolGlobal = pool;
// 	conn = pool.request();
// 	return conn.query("select getdate();")
//
// }).catch(err =>{
// 	console.log("ignore, we already have a connection");
// });


var poolGlobal = {};

let bandCount = 0;

let runsMagic = 5;

var band =  function (client) {

	console.log("==========BAND============" + bandCount);

	console.log("payload",client.options.skipgroup);
	var artist = JSON.parse(client.options.skipgroup);

	if(bandCount >= runsMagic){
		console.warn("bad reset");
		bandCount = 0
	}

	console.log("bandcount",bandCount);
	artist = artist[bandCount]
	bandCount++;
	console.log(artist.name);

	poolPromise.then(function(newPool){
		poolGlobal = newPool;

		let insert_artist = function (artist) {

			console.log("spotify artist:", artist);

			var keys = Object.keys(artist);
			var klist = keys.map(function (value) {
				return "" + value + ""
			}).join(",");
			var kparams = keys.map(function (value) {
				return "@" + value + ""
			}).join(",");

			var sreq = new sql.Request(poolGlobal);
			sreq.input("id", sql.VarChar(50), artist.id);
			sreq.input("name", sql.VarChar(50), artist.name);
			sreq.input("uri", sql.VarChar(100), artist.uri);


			//might not be a thing anymore
			//sreq.input("onTourUntil", sql.DateTimeOffset(7), as.onTourUntil)

			//todo: why did we want to return results that we already have?
			//should be a check to prevent this from happening - don't need to lookup artists
			//I already have info on

			var qry = "IF NOT EXISTS (SELECT * FROM dbo.artists WHERE id = @id)"
				+ " INSERT INTO dbo.artists(" + klist + ")"
				+ " OUTPUT inserted.id, inserted.name, inserted.uri"
				+ " VALUES(" + kparams + ")"
				+ " else select * from dbo.artists WHERE id = @id";


			sreq.query(qry).then(function (res) {
				console.log(res);
			}).catch(function (err) {
				console.log(err);
			})

		};

		let insert_artistSongkick = function (artist) {

			//todo: don't think this is consistent
			artist.displayName = artist.name;
			delete artist.name;

			//example from API docs

			// {
			// 	id: 253846,
			// 	displayName: "Radiohead",
			// 	uri: "http://www.songkick.com/artists/253846-radiohead?utm_source=45852&utm_medium=partner",
			// 	identifier: [
			// 	{
			// 		href: "http://api.songkick.com/api/3.0/artists/mbid:a74b1b7f-71a5-4011-9441-d0b5e4122711.json",
			// 		mbid: "a74b1b7f-71a5-4011-9441-d0b5e4122711"
			// 	}
			// ],
			// 	onTourUntil: "2018-04-25"
			// }

			console.log("songkick artist:", artist);

			var keys = Object.keys(artist);
			var klist = keys.map(function (value) {
				return "" + value + ""
			}).join(",");
			var kparams = keys.map(function (value) {
				return "@" + value + ""
			}).join(",");

			var sreq = new sql.Request(poolGlobal);

			var currentDate = new Date()
			sreq.input("id", sql.Int, artist.id);
			sreq.input("displayName", sql.VarChar(100), artist.displayName);
			sreq.input("identifier", sql.VarChar(150), artist.identifier);
			sreq.input("lastLook", sql.DateTimeOffset(7), currentDate);

			//doesn't seem to be a thing anymore?
			//sreq.input("onTourUntil", sql.DateTimeOffset(7), artist.onTourUntil)

			console.log(klist);
			console.log(kparams);

			//todo:

			// var qry = "IF NOT EXISTS (SELECT * FROM dbo.artistsSongkick WHERE id = @id)"
			// 	+ " INSERT INTO dbo.artistsSongkick("+ klist + ")"
			// 	+ " OUTPUT inserted.id, inserted.displayName, inserted.identifier"
			// 	+ " VALUES(" + kparams +")"
			// 	+ " else select * from dbo.artistsSongkick WHERE id = @id";

			sreq.execute("insert_artistSongkick").then(function (res) {
				console.log(res);
			}).catch(function (err) {
				console.log(err);
			})

		};

		//todo: need to remember to reinforce dual-type id convention

		//songkick
		if (typeof artist.id === "number") {
			insert_artistSongkick(artist)
		}
		//spotify
		else {
			insert_artist(artist)
		}
	});


	var search = 'input[class^=searchBar]';
	//var search = '.searchBar-cd6d0d92';
	var result = 'a[class^="artistResult"]';

	var bio = 'div[class^="artistBio"]';
	//var bio = '.artistBio-3b904004';

	var str = "";


	//console.log("client",JSON.stringify(client,null,4));
	//console.log("",Object.keys(client));


	try {
		client
			.url('https://www.bandsintown.com/en')
			.waitForElementVisible(search, 5000)
			.setValue(search, artist.name)
			.waitForElementVisible(result, 1000)
			.click(result)
			//don't know why this didn't work, don't think I need it tho
			//.waitForElementVisible(bio, 3000)
			.assert.visible('body')
			.source(function (result) {
				$ = $.load(result.value)
				let d = $(bio)

				//console.log("parsing...");
				d.each(function (k, elem) {
					let t = $(this).text();
					t = t.trim();
					if (t === "Genres:") {
						//console.log("$$",t);
						let next = d[k + 1];
						let tnext = $(next).text();
						//console.log("Genres:",tnext);

						//todo: shitty selector above produces genre list 3x and writes over last
						str = tnext;
					}
				})

				if (str.length > 0) {

					let genres = [];
					if (str) {
						if (str.indexOf(",") !== -1) {
							genres = str.split(",")
						} else {
							//console.warn("if this is >1 genre, there was an issue on split:",str);
							genres.push(str);
						}
					}

					//split funny genres
					//examples from https://www.bandsintown.com/en/a/12732676-funk-worthy
					// R&b/soul, R&b, Rock, Soul, Rnb-soul, Fusion, Funk

					let sGenres = [];
					genres.forEach(function (g) {
						g = g.trim().toLowerCase();

						if (g.indexOf("/") !== -1) {
							let sp = g.split("/");
							sp.forEach(function (s) {
								if (sGenres.indexOf(s) === -1) {
									sGenres.push(s)
								}
							})
						} else {
							if (sGenres.indexOf(g) === -1) {
								sGenres.push(g)
							}
						}
					});

					console.log("artist:", artist);
					console.log("acquired genres", sGenres);


					let qual_genres = [];

					//todo:testing exported pool

					var insertGenre = function (genre) {
						return new Promise(function (done, fail) {
							var sreq = new sql.Request(poolGlobal);
							var qry = "IF NOT EXISTS (SELECT * FROM dbo.genres WHERE name = @name) " +
								"INSERT INTO dbo.genres(name) OUTPUT inserted.id, inserted.name VALUES(@name) " +
								"else select * from dbo.genres WHERE name = @name";
							sreq.input("name", sql.VarChar(255), genre);
							sreq.query(qry).then(function (res) {
								// let rec = JSON.parse(res.recordset[0])
								console.log(res.recordset[0]);
								qual_genres.push(res.recordset[0]);
								done();

							}).catch(function (err) {
								console.log(err);
								fail(err);
							})
						})
					};

					let insert_genre_artist = function (genre, artist) {
						//console.log("insert_genre_artist");

						//todo: NOT SURE about decision to mix formats for artist_id here
						//songkick's numeric ids always treated as strings

						//todo: check if I need to encode incoming numeric artist id from songkick
						if (typeof artist.id === "number") {
							artist.id = artist.id.toString();
						}
						;

						//multi-object doesn't make sense to use k-extraction
						var klist = "genre_id,artist_id"
						var kparams = "@genre_id,@artist_id"

						var sreq = new sql.Request(poolGlobal);
						sreq.input("genre_id", sql.Int, genre.id);
						sreq.input("artist_id", sql.VarChar(50), artist.id);

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

					let gPromises = [];
					let gaPromises = [];

					//todo: skipping sql stuff for now (2)
					//need to know how I'm running repeated NW instances first

//					console.warn("skipping sql stuff for now");

					sGenres.forEach(function (genre) {
						gPromises.push(insertGenre(genre))
					});


					Promise.all(gPromises).then(function () {

						console.log("insertGenre finished");
						console.log("starting insert_genre_artist", qual_genres);

						qual_genres.forEach(function (genre) {
							gaPromises.push(insert_genre_artist(genre, artist));
						});

						Promise.all(gaPromises).then(function () {
							console.log("insert_genre_artist finished");

							//testing:
							if (bandCount === runsMagic) {
								console.log("reset bandCount");
								bandCount = 0;
							}
							//client.end()
						})
					})

				} else {

					let msg = "bandsintown failed to find genres";
					let error = {msg: msg, artist: artist.name, error: {}};
					console.error(error);

					//testing:
					if (bandCount === runsMagic) {
						console.log("reset bandCount");
						bandCount = 0;
					}

					//client.end()
					//fail(error)
				}


			})//source
			.end(function(){
				console.warn("========END==========");
				//testing:
				if (bandCount === runsMagic) {
					console.log("reset bandCount");
					bandCount = 0;
				}
			})

	}catch(e){

		console.error("test exception");
		// if (bandCount === 3) {
		// 	console.log("reset bandCount");
		// 	bandCount = 0;
		// }
	};

	//testing


}
module.exports = {
	tags: ['poe'],
	'Band0' : band,
	'Band1' : band,
	'Band2' : band,
	'Band3' : band,
	'Band4' : band,
};