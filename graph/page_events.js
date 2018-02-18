
var woodlands = require('./woodlands')
var drakes = require('./drakes')
var rumba = require('./rumba')
var skullys =  require('./skullys')

//test

var venues = []
venues.push(woodlands)
venues.push(drakes)
venues.push(rumba)
venues.push(skullys)

var print = function(){
    return new Promise(function(done, fail) {
        venues.forEach(function(event_array){

            // ISO8601 string representation lets us sort like normal strings and get chronological order
            event_array.data.sort(function(a, b) {
                return (a.start_time < b.start_time) ? -1 : ((a.start_time > b.start_time) ? 1 : 0);
            });
            console.log("--------------------------------------------");
            console.log(event_array)

        })
      done()
    })
}


print()
    .then(function(){
        console.log("FINISHED")
    })
    .catch(function(e){
        console.log("well shit");
        console.log(e);
    });



