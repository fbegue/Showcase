var FuzzyMatching = require('fuzzy-matching');
var fm = new FuzzyMatching([artist.name]);
var correctedAnswer = fm.get(item.name, { maxChanges: 2 }).value;