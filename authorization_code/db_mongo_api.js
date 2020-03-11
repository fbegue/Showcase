var import_client = require('./db').client
var client = {};
import_client().then(c =>{client = c;})


var insert =  function(events){
    return new Promise(function(done, fail) {
	    var dbo = client.db("master");
	    dbo.collection("events").insert(events).then(r =>{
	    	done(r)
	    })
    })
}

var fetch =  function(param){
	return new Promise(function(done, fail) {
		var dbo = client.db("master");
		var events = dbo.collection("events").find().toArray();
			done(events)
	})
}


module.exports = {insert,fetch}

//
// import_client().then(client =>{
// 	var dbo = client.db("master");
// 	dbo.collection("events").insert({test:1});
// 	var events = dbo.collection("events").find({}).toArray();
//
// 	events.then(e =>{console.log(e)})
// })

// events.each(e =>{
// 	console.log(e);
// });

// MongoClient.connect(url, function(err, c) {
//
// 	// const dbName = 'test';
//
// 	//const adminDb = client.db(dbName).admin();
// 	// adminDb.listDatabases(function(err, dbs) {
// 	// 	console.log("$dbs",dbs);
// 	// 	client.close();
// 	//
// 	// });
//
// 	var dbo = client.db("master");
// 	dbo.collection("events").insert({test:1});
// 	var events = dbo.collection("events").find({}).toArray();
// 	events.then(e =>{console.log(e)})
// 	// events.each(e =>{
// 	// 	console.log(e);
// 	// });
//
// });