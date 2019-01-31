const express = require('express');
let app = express();

//var router = express.Router();
//router.post("/test",test);

let test = function(req, res){
	console.log("test!");
	let data = "test";
	res.send({
		data
	});
}

app.post('/test',test);

console.log('Listening on 8887');
app.listen(8887);