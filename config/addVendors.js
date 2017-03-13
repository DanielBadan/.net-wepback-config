var path = require('path');
var paths = require('./paths');

function addVendor(config, name, path) {
	config.resolve.alias[name] = path;
	config.module.noParse.push(new RegExp(path));
}

module.exports = function(config) {
	// config.addVendor = function(name, path) {
	// 	this.resolve.alias[name] = path;
	// 	this.module.noParse.push(new RegExp(path));
	// },

	addVendor(config, 'velocity', path.resolve(paths.appSrc, 'lib/velocity.js'));
	addVendor(config, 'velocityUI', path.resolve(paths.appSrc, 'lib/velocity.ui.js'));
	addVendor(config, 'tooltipster', path.resolve(paths.appSrc, 'lib/jquery.tooltipster.js'));
	addVendor(config, 'fullpage', path.resolve(paths.appSrc, 'lib/jquery.fullPage.js'));
	addVendor(config, 'table-sort', path.resolve(paths.appSrc, 'lib/stupidtable.js'));

	addVendor(config, 'three', path.resolve(paths.appSrc, 'lib/space/three.js'));
	addVendor(config, 'Projector', path.resolve(paths.appSrc, 'lib/space/Projector.js'));
	addVendor(config, 'CanvasRenderer', path.resolve(paths.appSrc, 'lib/space/CanvasRenderer.js'));


	// jquery file upload deps
	addVendor(config, 'jq-validation', path.resolve(paths.appSrc, 'lib/jquery.validate.js'));
	addVendor(config, 'load-image', path.resolve('node_modules', 'blueimp-load-image/js/load-image.js'));
	addVendor(config, 'load-image-meta', path.resolve('node_modules', 'blueimp-load-image/js/load-image-meta.js'));
	addVendor(config, 'load-image-exif', path.resolve('node_modules', 'blueimp-load-image/js/load-image-exif.js'));
	addVendor(config, 'canvas-to-blob', path.resolve('node_modules', 'blueimp-canvas-to-blob/js/canvas-to-blob.js'));
};
