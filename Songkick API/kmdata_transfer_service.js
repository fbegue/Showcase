/**
 *
 * @module Service
 * @class Service
 * @constructor
 * @main
 */
"use strict";
var log = require("../config/log.js");
var configuration = require("../config/config");
var kmdataQuery = require("../config/kmdataQuery");
var orderOfDataWrite = [
	"program_area", "specialization", "form_specialization", "statewide_team", "plan_of_action", "indicator",
	"form_goals", "form_narratives", "delivery_method", "impact_area", "issue_area", "keywords", "LTOE",
	"MTOE", "STOE", "partnership", "roles", "scope_of_audience", "counties", "states",
	"team", "ext_program" , "ext_event",
	"riv_racialgroup_lookup",  "ext_event_group_record","ext_event_indicator", "ext_event_external_partner"];
//var orderOfDataWrite = ["counties","indicator", "form_goals", "team", "impact_area", "form_specialization", "ext_program"];
//var orderOfDataWrite = ["counties"]
//var orderOfDataWrite = ["specialization", "form_specialization"];
//var orderOfDataWrite = ["impact_area"];
//var orderOfDataWrite = ["program_area", "plan_of_action", "indicator"];
//var orderOfDataWrite = ["team"];
var dbs = require("../config/dbs");
dbs.kmdata = dbs.createPGSQLClient(configuration.kmdata);
var library = require("../util/kmdata");
var general = require("./general");
var mongoToKmdata = require("./mongoToKmdata");
var saveKmdata = require("./saveKmdata");
var truncateKmdata = require("./truncateKmdata");
var kmdataQueryModified = {};
for (var i in kmdataQuery) {
	kmdataQueryModified[i] = {};
	kmdataQueryModified[i].mapping = kmdataQuery[i];
	var fieldOrder = [];
	var writeOrder = [];
	var trackVar = 0;
	var secondaryQueries = [];
	for (var j in kmdataQuery[i]) {
		if(!(kmdataQuery[i][j] instanceof Object)) {
			if (j.substring(0, 1) !== "$") {
				fieldOrder[trackVar] = j;
				writeOrder[trackVar] = kmdataQuery[i][j];
				trackVar = trackVar + 1;
			}
			else if (j === "$user") {
				fieldOrder[trackVar] = "user_id";
				writeOrder[trackVar] = "user_id";
				trackVar = trackVar + 1;
			}
		}
		else{
			if(kmdataQuery[i][j].relation_table && kmdataQuery[i][j].local_id && kmdataQuery[i][j].foreign_table && kmdataQuery[i][j].foreign_id){
				kmdataQueryModified[i].mapping[j].type = "LocForBothExistArray";
			}
			else if(!(kmdataQuery[i][j].relation_table) && !(kmdataQuery[i][j].local_id) && kmdataQuery[i][j].foreign_table && kmdataQuery[i][j].foreign_id){
				kmdataQueryModified[i].mapping[j].type = "ForGoesIntoOriginalTable";
			}
			else if(kmdataQuery[i][j].relation_table && kmdataQuery[i][j].local_id && !(kmdataQuery[i][j].foreign_table) && kmdataQuery[i][j].foreign_id){
				kmdataQueryModified[i].mapping[j].type = "LocIDForFromProvidingArray";
			}
			else if(kmdataQuery[i][j].relation_table && kmdataQuery[i][j].local_id && !(kmdataQuery[i][j].foreign_table) && kmdataQuery[i][j].foriegnID_key_mapping  ){
				kmdataQueryModified[i].mapping[j].type = "LocIDForFromProvidingArrayOfObjects";
			}
		}
	}

	fieldOrder[fieldOrder.length] = "created_by";
	writeOrder[writeOrder.length] = "created_by";
	fieldOrder[fieldOrder.length] = "updated_by";
	writeOrder[writeOrder.length] = "updated_by";
	fieldOrder[fieldOrder.length] = "updated_at";
	writeOrder[writeOrder.length] = "updated_at";
	fieldOrder[fieldOrder.length] = "created_at";
	writeOrder[writeOrder.length] = "created_at";

	kmdataQueryModified[i].writeOrderString = writeOrder.toString();
	kmdataQueryModified[i].fieldOrder = fieldOrder;
	kmdataQueryModified[i].modelName = i;
	kmdataQueryModified[i].tableName = i;
	kmdataQueryModified[i].collectionName = i;
}
/**
 * List all teaching development records for a particular user or the system.
 * @method list
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
this.pushData = function(req, res, next) {
	var promiseTrack = new Promise(function(resolved) {
		console.log("Start the push of all CFAES data!!!");
		resolved();
	});
	orderOfDataWrite.forEach(function(value, i) {
		var record = [];
		var mapping = kmdataQueryModified[orderOfDataWrite[i]].mapping;
		var modelName = kmdataQueryModified[orderOfDataWrite[i]].modelName;
		var tableName = kmdataQueryModified[orderOfDataWrite[i]].tableName;
		var writeOrderString = kmdataQueryModified[orderOfDataWrite[i]].writeOrderString;
		var fieldOrder = kmdataQueryModified[orderOfDataWrite[i]].fieldOrder;
		promiseTrack = promiseTrack.then(function() {
			return (truncateKmdata.truncateTable(tableName)(record)
				.then(mongoToKmdata.streamData(req, modelName, tableName, writeOrderString, fieldOrder, mapping)))
		});
	});
	promiseTrack.then(function() {
		console.log("finish the push of all CFAES data!!!");
		(general.prepare(req)(promiseTrack))
			.then(next)
	})
		.catch(general.error(req, next));
};
