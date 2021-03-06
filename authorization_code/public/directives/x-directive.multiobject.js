/**
 * Directive for modeling objects into an array type property.
 * @class Directive:cfaesMultiObject
 * @constructor
 * @module cfaes
 * @param {Array} selection Should resolve to an Array to drive what options are available.
 * @param {String} display The field off of the objects in selection that should be used when displaying the objects
 * 		as options.
 * @param {String} [order] The field to order the selection by. Defaults to the displaying field.
 * @param {Boolean} [ordering] Indicates the sort direction for the ordered field. Defaults to true; See angular orderBy
 * 		documentation: https://docs.angularjs.org/api/ng/filter/orderBy .
 * @param {String} [notifications] When the selection array changes, this is used to indicate what field is changing
 * 		should data become lost from the update to the parent model.
 * @param {String} [root] File path for finding templates. This should essentially always be passed as "_widget._myroot"
 * 		assuming standard top-level widget configuration, but it is needed due to scope isolation.
 * @param {Boolean} [filterable] When it evaluates to true, a query field is provided for filtering the available
 * 		options. If false, the field is hidden. The default value if nothing is specified is true.
 * @param {Function} [lookup] The function should translate the _id value of an object to the actual object to use.
 * 		This is to resolve reference issues created by ng-repeat replicating objects, which break equality by reference
 * 		(ie. a === a or x.indexOf(a) where x = {a,b,c}).
 * @param {String} [name] String to display when generically referring to the options here-in. Particularly applies to
 * 		the display when options are filtered out or invisible.
 */

angular.module("showcase").filter("isVisible", function() {
	return function(items, flag) {
		if(!flag && flag !== false) {
			flag = true;
		}
		if(items && items.length) {
			var filtered = [];
			items.forEach(function(item) {
				if(item.visibility === undefined || item.visibility === flag) {
					filtered.push(item);
				}
			});
			return filtered;
		} else {
			return items;
		}
	};
});


angular.module("showcase").directive("cfaesMultiobject", function() {
	var modes = {};

	modes.unlimited = "multi";
	modes.single = "single";


	var templates = {};

	templates.checkbox = "" +

		"<div class=\"mso-container\">" +
		"<label class=\"multi-label\" ng-if=\"__filtering.enabled\">" +
		"<span>Filter Selection  </span>" + "<button  ng-click=\"toggle(null,'select')\"> all </button>" + "<button ng-click=\"toggle(null,'none')\" > none</button>" +

		"<input type=\"text\" ng-model=\"__filtering.query\"/>" +
		"</label>" +
		"<div class=\"multi-container\">" +
		"<div class=\"multi\" ng-repeat=\"obj in (internalCount = (selection | isVisible | filter:__filtering.querying() | orderBy:order:ordering))\">" +
		"<label>" +
		"<input type=\"checkbox\" ng-click=\"toggle(obj)\" ng-model=\"obj._cmo_checked\" ng-init=\"obj._cmo_checked = contained(obj)\"/>" +

		//todo: doesn't seem like contained here works, not sure if thats my fault or not
		/// "<span ng-class=\"{'contained':contained(obj)}\">{{obj[display]}}</span>" +
		"<span>{{obj[display]}}</span>" +
		"</label>" +
		"</div>" +
		"<div class=\"warning\" ng-if=\"internalCount && internalCount.length === 0 && selection && selection.length !== 0\">No {{fieldName}} Visible</div>" +
		"</div>" +
		"</div>";

	templates.selectRows = "" +
		"<div class=\"mso-container\">" +
		"<label class=\"multi-label\" ng-if=\"__filtering.enabled\">" +
		"<span>Filter  ({{getToggledCount()}})</span>" + "<button  ng-click=\"toggle(null,'select');\">  Toggle All </button>" +
		"<input type=\"text\" ng-model=\"__filtering.query\"/>" +
		"</label>" +
		"<div class=\"multi-container\">" +
		"<div class=\"multi\" ng-repeat=\"obj in (internalCount = (selection | isVisible | filter:__filtering.querying() | orderBy:order:ordering))\"" +
		"ng-class=\"{'contained':obj._cmo_checked}\" ng-click=\"toggle(obj)\" ng-init=\"obj._cmo_checked = contained(obj)\">" +

		//todo: ideally would be leveraging contained here
		 ///"ng-class=\"{'contained':contained(obj)}\" ng-click=\"toggle(obj)\" ng-init=\"obj._cmo_checked = contained(obj)\">" +

		"<label>" + "<span  >{{obj[display]}}</span>" + "</label>" +
		"</div>" +
		"<div class=\"warning\" ng-if=\"internalCount && internalCount.length === 0 && selection && selection.length !== 0\">No {{fieldName}} Visible</div>" +
		"</div>" +
		"</div>";

	// templates.selectGenres = "" +
	// 	"<div class=\"mso-container\">" +
	// 	"<label class=\"multi-label\" ng-if=\"__filtering.enabled\">" +
	// 	"<span>Filter  ({{getToggledCount()}})</span>" + "<button  ng-click=\"toggle(null,'select');\">  Toggle All </button>" +
	// 	"<input type=\"text\" ng-model=\"__filtering.query\"/>" +
	// 	"</label>" +
	// 	"<div class=\"multi-container\">" +
	// 	"<div class=\"multi\" ng-repeat=\"obj in selection | thisFamily:f:familyGenre_map | byGenreFreq:u:genre_freq_map\"" +
	// 	"ng-class=\"{'contained':obj._cmo_checked}\" ng-click=\"toggle(obj)\" ng-init=\"obj._cmo_checked = contained(obj)\">" +
	// 	"<label>" +
	// 	"<span  ng-style=\"{color:familyColor_map[g.family[f]]}\" >" +
	// 	"<span ng-if=\"g.family.length >1\">" +
	// 	"<button ng-click=\"user_cache_ctrl[u.id][g.name] = !user_cache_ctrl[u.id][g.name]\" style=\"transform: scale(.5);margin-left: -.5em;\">+</button>" +
	// 	"{{obj[display]}} </span> " +
	// 	"</span>" +
	// 	"</label>" +
	// 	"</div>" +
	// 	"<div class=\"warning\" ng-if=\"internalCount && internalCount.length === 0 && selection && selection.length !== 0\">No {{fieldName}} Visible</div>" +
	// 	"</div>" +
	// 	"</div>";

// <div ng-if="user_cache_ctrl[u.id][f]"
// 		ng-repeat="g in user_cache[u.id]['genres'] | thisFamily:f:familyGenre_map | byGenreFreq:u:genre_freq_map"
// 	ng-style="{color:familyColor_map[g.family[f]]}">
//
// 		&nbsp &nbsp &nbsp &nbsp {{g.name}} ({{genre_freq_map[u.id][g.genre_id]}})
// <span ng-if="g.family.length >1">
//
// 		<button ng-click="user_cache_ctrl[u.id][g.name] = !user_cache_ctrl[u.id][g.name]"
// 	style="transform: scale(.5);margin-left: -.5em;">+</button>
// 		<span ng-if="user_cache_ctrl[u.id][g.name]">
// 		(<span ng-repeat="g in g.family"
// 	ng-style="{color:familyColor_map[genreFam_map[g]]}">
// 		{{g}}
// </span>)
// 	</span>
// 	</span>
// 	</div>

	/* Abstract pluralizations */
	templates.checkboxes = templates.checkbox;
	// templates.selectRows = templates.selectRows;

	return {
		"require": ["ngModel"],
		"template": function(element, attrs) {
			return templates[attrs.type];
		},
		"scope": true,
		"restrict": "AECM",
		"link": function(scope, element, attrs, controllers) {
			var modeling = controllers[0];
			scope.mode = attrs.mode || modes.unlimited;
			scope.display = scope[attrs.display] || attrs.display;
			scope.order = scope.$eval(attrs.order) || attrs.order || attrs.display; // These $evals may be problematic with parent scopes visible
			scope.fieldName = scope.$eval(attrs.name) || attrs.name || "Options";
			scope.ordering = scope.$eval(attrs.ordering);
			scope.notifications = scope[attrs.notification] || attrs.notifications;
			scope.selection = scope[attrs.selection];
			scope.lookup = scope[attrs.lookup];

			//todo: WHAT? don't name these attr w/ camelcase? is this a known thing?
			//scope.startSelected = attrs.startSelected;
			scope.startselected = attrs.startselected;

			if(scope.ordering === undefined) {
				scope.ordering = true;
			}

			scope.__filtering = {};
			scope.__filtering.enabled = (attrs.filterable === undefined?true : !!scope.$eval(attrs.filterable));
			scope.__filtering.querying = function() {
				return function(object) {
					if(scope.__filtering.query) {
						return object[scope.display].toLowerCase().indexOf(scope.__filtering.query.toLowerCase()) !== -1;
					} else {
						return true;
					}
				};
			};

			//todo: why is this getting hit when I'm clearly not clicking 'anywhere near it' ?
			///specfically, when I'm using my rip-off multi select on families

			scope.getToggledCount = function(){
				//console.log("getToggledCount");
				return modeling.$modelValue.length;
			};

			scope.contained = function(object) {
				object = scope.lookup?scope.lookup(object._id):object;
				switch(scope.mode) {
					case modes.single:
						return modeling.$modelValue === object;
						break;
					case modes.unlimited:
						return modeling.$modelValue.indexOf(object) !== -1;
					default:
						console.warn("Unknown Multiobject Mode: ", scope.mode, element);
				}
			};



			scope.toggle = function(value,all) {
				// console.log("toggle",value);
				// console.log("toggle",all);
				switch(scope.mode) {
					case modes.single:
						modeling.$modelValue = value;
						break;
					case modes.unlimited:
						if(!scope.lookup) {
							console.debug("toggling with no lookup");
						}

						//todo: bottleneck?
						let setSelection = function(mValue,bol){
							scope.selection.forEach(function(sValue){
								if(mValue.id === sValue.id){
									sValue._cmo_checked = bol;
								}
							});
						};

						let toggleVal = function(value){
							value = scope.lookup?scope.lookup(value.id):value;
							var index = modeling.$modelValue.indexOf(value);

							if(index === -1) {
								modeling.$modelValue.push(value);
								setSelection(value,true);
							} else {
								modeling.$modelValue.splice(index, 1);
								setSelection(value,false)
							}
						};

						// if(all  === 'none'){
						// 	let preserve = JSON.parse(JSON.stringify(modeling.$modelValue));
						// 	preserve.forEach(function(v,i){	toggleVal(v)})
						// 	//scope.all = 'none';
						//
						// }else

						if(all  === 'select'){
							scope.selection.forEach(function(v,i){	toggleVal(v)})
							//scope.all = 'select';

						}else{
							toggleVal(value)
						}
						break;
					default:
						console.warn("Unknown Multiobject Mode: ", scope.mode, element);
				}
			};

			scope.$watch(attrs.selection, function(newVal) {
				scope.selection = scope.$eval(attrs.selection);

				var m, s, checking, removing = [], indexes = [];
				for(m=0;m<modeling.$modelValue.length;m++) {
					checking = true;
					for(s=0;s<newVal.length && checking;s++) {
						if(newVal[s]._id === modeling.$modelValue[m]._id) {
							checking = false;
						}
					}
					if(checking) {
						removing.unshift(modeling.$modelValue[m]);
						indexes.unshift(m);
					}
				}

				//wait until after we process things above, otherwise weird things happen? idk man
				if(attrs.startselected){
					setTimeout(function() {
						scope.all = 'select';
						scope.toggle(null,'select');scope.$digest()
					},10)
				}

				//not really sure what this does
				if(removing.length) {
					var scoping = scope.$new();
					scoping.removing = removing;
					scoping.type = scope.notifications;
					/* We currently can not block this action because the scope is blocked. Later we can expand
					 * the tracking here to allow programatic shifts back to the original source on update by
					 * passing the parent objects */
					indexes.forEach(function(remove) {
						modeling.$modelValue.splice(remove, 1); // TODO: Move to accept function
					});
					scoping.accept = function() {
//						console.log("Accepted"); // TODO:
					};
					scoping.reject = function() {
//						console.log("Rejected"); // TODO:
					};
					// ngDialog.open({
					// 	"template": scope._widget._myroot + "dialog.objects-dropped.html",
					// 	"className":"widget-cfaesProfile space-cfaes space-widget-dialog widget-dialog-confirm",
					// 	"scope": scoping
					// });
				}
			});
		}
	};
});
