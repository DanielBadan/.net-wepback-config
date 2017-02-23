var paths = require('./paths');
var appEntries = paths.appEntries;

module.exports = function(defaultEntries) {
	var entries = {};

	Object.keys(appEntries).forEach(function(key) {
		entries[key] = defaultEntries.slice();
		entries[key].push(appEntries[key]);
	});

	return entries;
};
