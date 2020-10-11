if(phase === 'insertStaticGenres'){
	//another step in this sequence takes cares of fid insert here
}
else{

	var fid = me.genreNameFamilyIdMap[genre] || null;

	//find better value
	if(!(fid)){
		//console.log("TODO: attempt to find new family");

		//fid was looking for an exact genre match. now:

		//split the genre string and detect substrings that:
		//1) X match directly on a genre_name
		//2) X match directly on a family_name
		//3) X match some special inference based on input genre
		//4) match on a partial genre_name (substrings to substring genre_name)


		//special rules
		//todo: indie = indie rock?
		var specialLogic = {};
		specialLogic["rap"] = "hip hop";

		//temp reverse map
		var locmap = {};
		Object.keys(me.familyMap).forEach(id =>{
			locmap[me.familyMap[id]] = id;
		})

		fid = function getLike(g){
			var match = null
			// Object.keys(me.familyMap).forEach(f => {
			for (var f in me.familyMap){
				//console.log(f);
				//split the unknown genre at \s and try to find it's keys in our family names
				var gkeys = g.split(" ");

				//add on contrived keys
				gkeys.forEach((k, i, arr) => {
					if (specialLogic[k]) {
						arr.push(specialLogic[k])
					}
				})
				gkeys.forEach(k => {
					//for each family, can we find a key as a substring?
					if (f.indexOf(k) !== -1) {
						//console.log("match: " + g + " to " + f + " on " + k)
						!(match)?match=f:{};
					}
				})
			}
			//!(match)?console.log("failure",g):{}
			console.log("$m",match);
			//todo: return id at match
			return locmap[match]
			return match;
		}
		// console.log(me.familyMap);
		// var familyName = getLike(genre)
		// console.log("$m1",familyName);
		console.log("$",genre);

	}

	if(!(fid)){
		console.warn("#",genre);
		//testing
		done(res.recordset);

	}else{
		//----------------------------------------------------
		var sreq2 = new sql.Request(sApi.poolGlobal);
		var qry = "IF NOT EXISTS (SELECT * FROM dbo.genre_family WHERE genre_id = @genre_id) " +
			"INSERT INTO dbo.genre_family(genre_id,family_id) OUTPUT inserted.genre_id, inserted.family_id VALUES(@genre_id,@family_id) " +
			"else select * from dbo.genre_family WHERE genre_id = @genre_id";
		sreq2.input("genre_id", sql.Int, res.recordset[0].id);
		sreq2.input("family_id", sql.Int, fid);
		sreq2.query(qry).then(function (res) {
			res.recordset[0].family_id = fid;
			console.log(res.recordset[0]);
			done(res.recordset);
		})
	}
}