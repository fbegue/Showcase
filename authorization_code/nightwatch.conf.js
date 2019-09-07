const chromedriver = require("chromedriver");
const geckodriver = require("geckodriver");

let runCount = 0;

module.exports = (function (settings) {

	//settings.test_workers = {};
	//settings.test_workers.enabled = true;
	//settings.test_workers.workers = "auto"

	//forgot why, but couldn't resolve path to chromedriver unless I did it thru here?
	settings.webdriver.server_path = chromedriver.path;
	//settings.selenium.server_path = chromedriver.path;

	//settings.selenium.cli_args["webdriver.chrome.driver"] = chromedriver.path;


	// let args = ["headless", "no-sandbox", "disable-gpu"]
	// args.push("--user-data-dir=C:/ChromeProfile/Profile1")
	// settings.test_settings.chrome1.desiredCapabilities.chromeOptions.args = args;


	//let chrome_options = chromedriver.ChromeOptions()
	//chrome_options.add_argument('--user-data-dir=C:/ChromeProfile/Profile1')
	//Profile2,Profile3, etc.

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