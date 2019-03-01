/**
 * Directive for modeling an array of strings as checkboxes
 * @class Directive:deCheckbox
 * @constructor
 * @module de
 */
angular.module("showcase").directive("deCheckbox", function() {

	var templates = {};
	templates.checkbox = "" +

		"<div class=\"widget-input-target widget-input-cbSet\" ng-repeat=\"type in options\">" +
		"<label>" +
		"<input class=\"widget-input-target widget-input-left\" type=\"checkbox\" ng-click=\"toggle(type)\" ng-model=\"map[type.Name]\"/>" +
		"<span class=\"widget-input-cbSet-label\" >{{type.Name}}</span>" +
		"</label>" +
		"</div>";


	return {
		"require": ["ngModel"],
		"template": function(element, attrs) {
			return templates[attrs.type];
		},
		"scope": true,
		"restrict": "AECM",
		"link": function(scope, element, attrs, controllers) {
			var modeling = controllers[0];

			// console.log("deCheckbox");
			// console.log(scope.$eval(attrs.options));
			// console.log(attrs.type);console.log(modeling);
			// console.log(scope.$eval(attrs.change));
			// console.log(scope.$eval(attrs.key));

			scope.options = scope.$eval(attrs.options);

			scope.map = {};

			//you can see above in the template that the model INSIDE THE SCOPE OF THIS DIRECTIVE
			//is binded to map. the format an default angular multiselect box looks like this:
			//scope.map = {"Course Related":true};

			//we don't want to store the checkbox choices in that object form, we want them as
			//an array of strings. so how do we manipulate the model value of THIS DIRECTIVE so
			//that is works with checkboxes, but when anyone looks at the scope of the ELEMENT that
			//this directive is rendered into on the page, it looks like ["Course Related"] ?

			//we say "when you check a box, your actually editing the $modelValue to reflect what we want
			//scope.map will always be in the same form as above, but when anyone else looks at this,
			//they just see the mutations we've made below (which, correspond to different actions that
			//change the actual model scope.map, i.e. checking and unchecking)


			//obviously, whatever your html is passing as its ng-model better be defined when you try to toggle
			//in this case, it better be an array
			scope.toggle = function(type){

				var insert;
				var ind = -1;

				//the value we toggled on - is it an uncheck or a check?
				//we can find out by cheeeecccking hahahhahhaa kill me

				//console.log(modeling.$modelValue);

				var idKey = attrs.key;

				for(var x = 0; x < modeling.$modelValue.length; x++){
					console.log(modeling.$modelValue[x][idKey] + " :/: " + type[idKey]);
					if(modeling.$modelValue[x][idKey] === type[idKey]){
						// insert = false;
						ind = x;
						break;
					}
				}

				insert = ind === -1;
				insert ? modeling.$modelValue.push(type) : modeling.$modelValue.splice(ind,1);

				// console.log("ind",ind);
				// console.log(insert);
				// console.log( modeling.$modelValue);
				// console.log(type);

				//if you provided one
				scope.bindEdit = scope.$eval(attrs.change);
				if(scope.bindEdit){
					//todo: oddly specific
					scope.bindEdit ? scope.bindEdit(modeling.$modelValue,attrs.field,type,insert) : {};
				}else{
					modeling.$modelValue = !modeling.$modelValue;
				}
			};


			//when we do the init for this element, use the [String,String]
			//values we retrieved from the server to set the model of the DIRECTIVE
			//to match what we interpret those values to mean (in this case, if a string
			//is present, its true. otherwise, false)

			scope.watching = modeling;
			scope.$watch("watching.$modelValue", function(newVal) {

				var checkValues = function(typesInput){

					var values = {};
					if(typesInput.length > 0){
						typesInput.forEach(function(typeOb){
							values[typeOb.Name] = true;
						});
					}
					return values;
				};

				if(modeling.$modelValue){
					//console.log(modeling.$modelValue);
					scope.map = checkValues(modeling.$modelValue);
				}
			});
		}
	};
});
