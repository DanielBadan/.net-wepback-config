var path = require('path');
var paths = require('./paths');

module.exports = function(config) {
	config.addVendor = function(name, path) {
		this.resolve.alias[name] = path;
		this.module.noParse.push(new RegExp(path));
	},

	config.addVendor('velocity', path.join(paths.appSrc, 'lib/velocity.js'));
	config.addVendor('velocityUI', path.join(paths.appSrc, 'lib/velocity.ui.js'));
	config.addVendor('tooltipster', path.join(paths.appSrc, 'lib/jquery.tooltipster.js'));
	config.addVendor('fullpage', path.join(paths.appSrc, 'lib/jquery.fullPage.js'));
	config.addVendor('table-sort', path.join(paths.appSrc, 'lib/stupidtable.js'));

	config.addVendor('three', path.join(paths.appSrc, 'lib/space/three.js'));
	config.addVendor('Projector', path.join(paths.appSrc, 'lib/space/Projector.js'));
	config.addVendor('CanvasRenderer', path.join(paths.appSrc, 'lib/space/CanvasRenderer.js'));


	// jquery file upload deps
	config.addVendor('jq-validation', path.join(paths.appSrc, 'lib/jquery.validate.js'));
	config.addVendor('load-image', path.join('node_modules', 'blueimp-load-image/js/load-image.js'));
	config.addVendor('load-image-meta', path.join('node_modules', 'blueimp-load-image/js/load-image-meta.js'));
	config.addVendor('load-image-exif', path.join('node_modules', 'blueimp-load-image/js/load-image-exif.js'));
	config.addVendor('canvas-to-blob', path.join('node_modules', 'blueimp-canvas-to-blob/js/canvas-to-blob.js'));
};
