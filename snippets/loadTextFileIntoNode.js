var path = "./graph/sample.txt";

var loadTextFileIntoNode = function(){
    return new Promise(function(done, fail) {
        console.log("loadTextFileIntoNode");
        fs.readFile(path, function (err, data) {
            if (err) {
                console.log(err)
            }
            console.log(data)
            //file = data;
            // file =  '<div class="_4uly"> Upcoming Events </div>'
            done()

        });
    })
}