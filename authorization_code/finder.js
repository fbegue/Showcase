
//const { poolPromise } = require('./../db.js')
const spotify_api = require('./spotify_api')
const poolGlobal = spotify_api.poolGlobal;
let sql = require("mssql")

module.exports.checkDb = function(){
	var sreq = new sql.Request(poolGlobal);
	sreq.query("select getdate();")
		.then(function(res){
			console.log("#res",res);
		})
};

module.exports.checkDBForArtist =  function(artist){
	return new Promise(function(done, fail) {


		//todo:
		//console.log("in",artist.id);
		//console.log("qry",qry);

	})
};