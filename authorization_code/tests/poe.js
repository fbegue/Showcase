var $ = require('cheerio');
let sql = require("mssql")

var band =  function (client) {

	console.log("==========BAND============");
	var url = 'http://192.168.68.1/webpages/index.html';
	try {
		client
			.url(url)
			// .waitForElementVisible(search, 5000)
			// .setValue(search, artist.name)
			// .waitForElementVisible(result, 1000)
			// .click(result)
			//don't know why this didn't work, don't think I need it tho
			//.waitForElementVisible(bio, 3000)
			// .assert.visible('body')
			.source(function (result) {
				console.log(result.value);
				$ = $.load(result.value)
			})//source
			.end(function(){
				console.warn("========END==========");
				//testing:

			})
	}catch(e){
		console.error("test exception");
		// if (bandCount === 3) {
		// 	console.log("reset bandCount");
		// 	bandCount = 0;
		// }
	}
}
band();