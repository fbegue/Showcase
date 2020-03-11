const sql = require('mssql')
//const config = {/*...*/}

var config = {
	"user": 'test',
	"password": 'test',
	"server": 'DESKTOP-TMB4Q31\\SQLEXPRESS',
	"database": 'master',
	"port": '61427',
	"dialect": "mssql",
};



var client =  function(){
	return new Promise(function(done, fail) {
		const MongoClient = require('mongodb').MongoClient;
		const url = 'mongodb://localhost:27017/master';
		MongoClient.connect(url, function(err, c) {
			console.log('Connected to mongo')
			done(c)
		})
	})
}


const poolPromise = new sql.ConnectionPool(config)
	.connect()
	.then(pool => {
		console.log('Connected to MSSQL')
		return pool
	})
	.catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
	sql, poolPromise,client
}