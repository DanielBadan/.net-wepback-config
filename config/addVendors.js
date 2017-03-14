'use strict';

var path = require('path');
var paths = require('./paths');

function addVendor(config, name, path) {
	config.resolve.alias[name] = path;
	config.module.noParse.push(new RegExp(path));
}

module.exports = function(config) {
	// Uncomment when adding any vendors
	// config.module.noParse = [];
	
	/* Example
	addVendor(config, 'whatever', path.resolve(paths.appSrc, 'lib/whatever.js'));
	addVendor(config, 'foo', path.resolve('node_modules', 'foo/src/js/foo.js'));
	*/
};
