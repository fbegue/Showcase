//testing: method for calling endpoints from local functions
//basically just send a res that will be the callback
//and remove the .then() from it b/c it will be immediately undefined otherwise
var req2 = {};var res2 = {send:function(d){
		console.log("here",d)
		res.send(d);
	}};
me.getMySavedTracks(req2,res2)