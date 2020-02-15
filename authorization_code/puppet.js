const puppeteer = require('puppeteer');
var $ = require('cheerio');
var Bottleneck = require("bottleneck");


//todo: optimize
let limiterBand = new Bottleneck({
	maxConcurrent: 1,
	minTime: 300,
	trackDoneStatus: true,
});


var go = function(){

	var search = 'input[class^=searchBar]';
	//var search = '.searchBar-cd6d0d92';
	var result = 'a[class^="artistResult"]';
	var bio = 'div[class^="artistBio"]';
	//var bio = '.artistBio-3b904004';
	var str = "";

	var puppet =  function(artist){
		return (async (artist) => {
			console.log("artist",artist);
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			page.setDefaultTimeout(1000)
			var url = 'https://www.bandsintown.com/en';
			await page.goto(url,{timeout:3000});
			await page.waitForSelector(search)
			await page.focus(search)
			await page.keyboard.type(artist)
			await page.waitForSelector(result)
			await page.click(result)
			await page.waitForSelector(bio,{timeout:3000})
			//page.screenshot({path: 'example.png'});
			const renderedContent = await page.evaluate(() => new XMLSerializer().serializeToString(document));
			$ = $.load(renderedContent)
			let d = $(bio)
			console.log("parsing...");
			d.each(function (k, elem) {
				let t = $(this).text();
				t = t.trim();
				if (t === "Genres:") {
					let next = d[k + 1];
					let tnext = $(next).text();
					//todo: shitty selector above produces genre list 3x and writes over last
					str = tnext;
				}
			})

			let sGenres = [];
			if (str.length > 0) {
				let genres = [];
				if (str) {
					if (str.indexOf(",") !== -1) {genres = str.split(",")}
					else {genres.push(str);}
				}

				//split funny genres
				//examples from https://www.bandsintown.com/en/a/12732676-funk-worthy
				// R&b/soul, R&b, Rock, Soul, Rnb-soul, Fusion, Funk

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
			}
			await browser.close()
			return {artist:artist,genres:sGenres};
		})(artist)
			.catch(function(e){
				console.log("artist failure", artist);
			})
	};

	//testing:
	// puppet("test1")
	// 	.then(function(){
	// 		console.log("done");
	// 	})
	//

	//todo: not sure why blink is failing exactly
	var ars = ['papa roach','muse','blink 182']
	var promises = [];
	ars.forEach(function(a) {
		promises.push(limiterBand.schedule(puppet, a))
	});
	Promise.all(promises)
		.then((bRes) => {
			console.log("bRes",bRes);
		})
		.catch(function(err){
			console.log("getBandPage failure",err);
		})
}

module.exports.puppet = function(){
	return new Promise(function(done, fail) {
		go()
	})
}
