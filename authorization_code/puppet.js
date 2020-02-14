const puppeteer = require('puppeteer');
var $ = require('cheerio');

var search = 'input[class^=searchBar]';
//var search = '.searchBar-cd6d0d92';
var result = 'a[class^="artistResult"]';

var bio = 'div[class^="artistBio"]';
//var bio = '.artistBio-3b904004';

var str = "";

var puppet = function(){

	(async () => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		var url = 'https://www.bandsintown.com/en';
		await page.goto(url);
		await page.screenshot({path: 'example.png'});
		await page.waitForSelector(search)
		await page.focus(search)
		await page.keyboard.type('papa roach')
		await page.waitForSelector(result)
		await page.click(result)
		await page.waitForSelector('body') //.assert.visible('body')
		page.screenshot({path: 'example.png'});

		//todo: couldn't get either working

		//just puppeteer

		//await page.waitForSelector(bio)
		//await page.$eval(bio, (element) => { console.log(element);console.log(element.innerHTML); p= element.innerHTML})

		//really not sure why this isn't working

		//const renderedContent = await page.evaluate(() => new XMLSerializer().serializeToString(document));
		// console.log(renderedContent);
		// $ = $.load(renderedContent)
		// let d = $(bio)
		// console.log(d);
		// console.log("parsing...");


		// d.each(function (k, elem) {
		// 	let t = $(this).text();
		// 	t = t.trim();
		// 	if (t === "Genres:") {
		// 		//console.log("$$",t);
		// 		let next = d[k + 1];
		// 		let tnext = $(next).text();
		// 		//console.log("Genres:",tnext);
		//
		// 		//todo: shitty selector above produces genre list 3x and writes over last
		// 		str = tnext;
		// 	}
		// })
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
		}
		console.log("done");

		// await browser.close()
		// 	.then(() => {
		// 		console.log("1");
		// 		//not sure why wouldn't work
		// 		// page.$eval(search, el => el.value = 'doit')
		// 		page.focus(search)
		// 		page.keyboard.type('test54')
		// 			.then(function(){
		// 				console.log("2");
		// 				page.screenshot({path: 'example.png'});
		// 				console.log("finish");
		// 			})
		// 	});
	})();

	// (async () => {
	// 	console.log("puppet");
	// 	const browser = await puppeteer.launch();
	// 	const page = await browser.newPage();
	// 	// var url = 'https://www.bandsintown.com/en';
	// 	var url = 'https://example.com';
	// 	page.goto(url).then(e=>{
	// 		page.screenshot({path: 'example.png'});
	// 		console.log("0");
	// 		// page.waitForSelector(search)
	// 		// 	.then(() =>
	// 		// 	{
	// 		// 		console.log("1");
	// 		// 		page.$eval(search, el => el.value = 'doit')
	// 		// 			.then(function(){
	// 		// 				page.screenshot({path: 'example.png'});
	// 		// 				console.log("finish");
	// 		// 			})
	// 		// 	})
	// 	})
	//
	// 	//await page.screenshot({path: 'example.png'});
	// 	await browser.close();
	// })();
}



module.exports.puppet = function(){
	return new Promise(function(done, fail) {
		puppet();
	})
}
