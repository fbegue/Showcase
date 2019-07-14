const chromedriver = require("chromedriver");
module.exports = (function (settings) {

	settings.test_workers = {};
	settings.test_workers.enabled = true;
	settings.test_workers.workers = "auto"
	settings.webdriver.server_path = chromedriver.path;

	//todo: works
	//settings.globals = {};
	//settings.globals.artist = "Funk Worthy"

	// settings.chrome = {
	// 	"desiredCapabilities": {
	// 		"javascriptEnabled": true,
	// 		"acceptSslCerts": true,
	// 		"browserName": "chrome",
	// 		"chromeOptions" : {
	// 			"args" : ["headless", "no-sandbox", "disable-gpu"]
	// 		}
	// 	}
	// }

	// settings.webdriver.desiredCapabilities =
	// 	{
	// 		"javascriptEnabled": true,
	// 		"acceptSslCerts": true,
	// 		"browserName": "chrome",
	// 		"chromeOptions": {
	// 			"args": ["headless", "no-sandbox", "disable-gpu"]
	// 		}
	// 	}

	return settings;
})(require("./nightwatch.json"));