/**
 * testing the usability of a promise structure that guarantees synchronicity
 * @function test_promise
 **/
var test_promiseTrack = function(){

	var func_1 = function(func1_in){
		return new Promise(function(done, fail) {

			console.log("func1_in",func1_in);

			setTimeout(function(){

				func1_in.ind1++;

				console.log("func1_in result",func1_in);
				done(func1_in)

			}, 1000);

		})
	};

	var func_2 = function(func2_in){
		return new Promise(function(done, fail) {

			console.log("func2_in",func2_in);

			setTimeout(function(){

				func2_in.ind1++;

				console.log("func2_in result",func2_in);
				done(func2_in)

			}, 3000);

		})
	};

	var requests = [
		{"id":1,"ind1":10,"ind2":100},
		{"id":2,"ind1":20,"ind2":200},
		{"id":3,"ind1":30,"ind2":300},
	];

	var promiseTrack = new Promise(function(resolved) {
		console.log("Start...");
		resolved();
	});

	requests.forEach(function(value, i) {

		promiseTrack = promiseTrack.then(function() {
			return (func_1(value))
			// .then(func_2(value))
		});
	});
	promiseTrack.then(function(finish) {
		console.log("...finish",finish);

	})
		.catch(function(err){
			console.log("err: ",err);
		});
}

//test_promiseTrack()


var test_promise = function(){

	var test1 =  function(){
	    return new Promise(function(done, fail) {

			setTimeout(function(){
				console.log("test1 finished");
				}, 3000);
			done()
	    })
	}

	var test2 =  function(){
		return new Promise(function(done, fail) {

			console.log("test2 finished");
			done()
		})
	}

	test1()
		.then(test2)
		.then(function(){
		console.log("FINISHED!");
	})

};

//test_promise()

var test_promise_sync = function(){

	var test1 = function(){
		return new Promise(function(done, fail) {

			setTimeout(function(){
				console.log("test1 finished");
			}, 3000);
			done()
		})
	}

	var test2 =  function(){
		return new Promise(function(done, fail) {
			console.log("test2 finished");
			done()
		})
	}


	var tasks = [];
	tasks.push(test1())
	tasks.push(test2())

	return tasks.reduce((promiseChain, currentTask) => {
		return promiseChain.then(chainResults =>
			currentTask.then(currentResult =>
				[ ...chainResults, currentResult ]
			)
		);
	}, Promise.resolve([])).then(arrayOfResults => {
		// Do something with all results
	});

}

test_promise_sync()