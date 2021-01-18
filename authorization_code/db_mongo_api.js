var import_client = require('./db').client
var client = {};
import_client().then(c =>{client = c;})

//always empties the DB before inserting
var insert =  function(events){
	return new Promise(function(done, fail) {
		var dbo = client.db("master");
		//infer correct collection from one sample event
		// dbo.collection(events[0].venue.metroArea.id).insert(events).then(r =>{
		// 	done(r)
		// })
		console.log("committing to mongo collection:",events[0].venue.metroArea.id);
		var c = events[0].venue.metroArea.id.toString()
		dbo.collection(c).deleteMany({}).then(r =>{
			dbo.collection(c).insertMany(events).then(r2 =>{
				done(r2)
			})
		})
		//todo: can't figure out the easy way to do a massive insert if not already in collection wtf?
		//it can't really be a find and insert if not found right?

		// https://docs.mongodb.com/stitch/mongodb/actions/collection.insertMany/
		// https://docs.mongodb.com/stitch/mongodb/actions/collection.updateMany/

		//.updateMany({},events,{"upsert":true}).then(r =>{


	})
}

var insertStaticUser =  function(payload){
	return new Promise(function(done, fail) {
		var dbo = client.db("master");
		dbo.collection('users').insertMany(payload).then(r2 =>{
			done(r2)
		})
	})
}

var fetchStaticUser =  function(user){
	return new Promise(function(done, fail) {
		var dbo = client.db("master");
		done(dbo.collection('users').find({user:user}).toArray());
	})
}

var fetch =  function(param){
	return new Promise(function(done, fail) {
		var events = [];
		console.log("fetching...");
		var dbo = client.db("master");

		if(param === 'all'){
			var states = {"OH":[
					{"displayName":"Columbus", "id":9480},
					{"displayName":"Cleveland", "id":14700},
					{"displayName":"Cincinnati", "id":22040},
					// {"displayName":"Dayton", "id":3673},
					{"displayName":"Toledo", "id":5649}
				]};
			var proms = [];
			states['OH'].forEach(m =>{
				//console.log("m",m.id);
				proms.push(dbo.collection(m.id.toString()).find().toArray())
			})
			Promise.all(proms)
				.then(r =>{
					r.forEach(ra =>{
						events = events.concat(ra);
					})
					console.log(events.length);
					done(events)
				})
		}else{
			events = events.concat(dbo.collection(param).find().toArray())
			done(events)
		}
	})
}


module.exports = {insert,fetch,insertStaticUser,fetchStaticUser}

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