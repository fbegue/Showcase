


if (typeof(window) !== 'undefined') {

    (function(exports) {

        var artist_array = ["My Morning Jacket", "Killer Mike", "Run The Jewels"]

        exports.artists = function(){
            return artist_array
        }
        console.log( exports.artists)

    })(window);

} //!== undefined window
