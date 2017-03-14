'use strict';

var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var paths = require('./paths');
var getClientEnvironment = require('./env');

var addVendors = require('./addVendors');
var configEntries = require('./configEntries');
var providePlugins = require('./providePlugins');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
var publicPath = paths.servedPath;

// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
var shouldUseRelativeAssetPaths = publicPath === './';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
var publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
	throw new Error('Production builds must have NODE_ENV=production.');
}

// Note: defined here because it will be used more than once.
const cssFilename = 'css/[name].[contenthash:8].css';

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginPublicPath = shouldUseRelativeAssetPaths
	// Making sure that the publicPath goes back to to build folder.
	? Array(cssFilename.split('/').length).join('../') : undefined;

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
var config = {
	// Don't attempt to continue if there are any errors.
	bail: true,
	// We generate sourcemaps in production. This is slow but gives good results.
	// You can exclude the *.map files from the build during deployment.
	devtool: 'source-map',
	// In production, we only want to load the polyfills and the app code.
	entry: configEntries([require.resolve('./polyfills')]),
	output: {
		// The build folder.
		path: paths.appBuild,
		// Generated JS file names (with nested folders).
		// There will be one main bundle, and one file per asynchronous chunk.
		// We don't currently advertise code splitting but Webpack supports it.
		filename: 'js/[name].[chunkhash:8].js',
		chunkFilename: 'js/[name].[chunkhash:8].chunk.js',
		// We inferred the "public path" (such as / or /my-project) from homepage.
		publicPath: publicPath
	},
	resolve: {
		// This allows you to set a fallback for where Webpack should look for modules.
		// We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
		// We use `fallback` instead of `root` because we want `node_modules` to "win"
		// if there any conflicts. This matches Node resolution mechanism.
		// https://github.com/facebookincubator/create-react-app/issues/253
		modules: paths.modulesDirectories,
		// These are the reasonable defaults supported by the Node ecosystem.
		// We also include JSX as a common component filename extension to support
		// some tools, although we do not recommend using it, see:
		// https://github.com/facebookincubator/create-react-app/issues/290
		extensions: ['.js', '.json', '.jsx'],
		alias: {},
	},

	module: {
		noParse: [],
		rules: [
			// First, run the linter.
			// It's important to do this before Babel processes the JS.
			{
				test: /\.(js|jsx)$/,
				loader: 'eslint-loader',
				enforce: 'pre',
				include: paths.appSrc,
				exclude: /node_modules|lib/,
			},
			
			// ** ADDING/UPDATING LOADERS **
			// The "url" loader handles all assets unless explicitly excluded.
			// The `exclude` list *must* be updated with every change to loader extensions.
			// When adding a new loader, you must add its `test`
			// as a new entry in the `exclude` list in the "url" loader.

			// "url" loader embeds assets smaller than specified size as data URLs to avoid requests.
			// Otherwise, it acts like the "file" loader.
			{
				exclude: [
					/\.html$/,
					/\.(js|jsx)$/,
					/\.css$/,
					/\.less$/,
					/\.json$/,
					/\.svg$/
				],
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'media/[name].[hash:8].[ext]'
				}
			},
			// Process JS with Babel.
			{
				test: /\.(js|jsx)$/,
				include: paths.appSrc,
				loader: 'babel-loader',
			},
			// The notation here is somewhat confusing.
			// "postcss" loader applies autoprefixer to our CSS.
			// "css" loader resolves paths in CSS and adds assets as dependencies.
			// "style" loader normally turns CSS into JS modules injecting <style>,
			// but unlike in development configuration, we do something different.
			// `ExtractTextPlugin` first applies the "postcss" and "css" loaders
			// (second argument), then grabs the result CSS and puts it into a
			// separate file in our build process. This way we actually ship
			// a single CSS file in production instead of JS code injecting <style>
			// tags. If you use code splitting, however, any async bundles will still
			// use the "style" loader inside the async code so CSS from them won't be
			// in the main CSS file.
			{
				test: /\.(css|less)$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								importLoaders: 2
							}
						}, 
						{
							// We use PostCSS for autoprefixing only.
							loader: 'postcss-loader',
							options: {
								plugins: function() {
									return [
										autoprefixer({
											browsers: [
												'>1%',
												'last 4 versions',
												'Firefox ESR',
												'not ie < 9', // React doesn't support IE8 anyway
											]
										}),
									]
								}
							}
						}, 
						{
							loader: 'less-loader'
						}
					],
					publicPath: extractTextPluginPublicPath
				})
				// Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
			},
			// "file" loader for svg
			{
				test: /\.svg$/,
				loader: 'file-loader',
				options: {
					name: 'media/[name].[hash:8].[ext]'
				}
			},
			{ test: /\.html$/, loader: 'raw-loader', exclude: /assetTemplate\.html$/ },
			{ 
				test: /blueimp-file-upload[\\\/]js[\\\/].*/, 
				loader: 'imports-loader?define=>false',
			},
			{ test: /jquery[\\\/]src[\\\/]selector\.js$/, loader: 'amd-define-factory-patcher-loader' }, 
			{
				test: /knockout-sortablejs/,
				loader: 'imports-loader?define=>false',
			}
		]
	},

	plugins: [
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new webpack.ProvidePlugin(providePlugins),
		// Makes some environment variables available to the JS code, for example:
		// if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
		// It is absolutely essential that NODE_ENV was set to production here.
		// Otherwise React will be compiled in the very slow development mode.
		new webpack.DefinePlugin(env.stringified),
		// Minify the code.
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			compress: {
				screw_ie8: true,
				warnings: false
			},
			mangle: {
				screw_ie8: true
			},
			output: {
				comments: false,
				screw_ie8: true
			}
		}),
		// Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
		new ExtractTextPlugin(cssFilename),
		// Generate a manifest file which contains a mapping of all asset filenames
		// to their corresponding output file so that tools can pick it up without
		// having to parse `index.html`.
		new ManifestPlugin({
			fileName: 'asset-manifest.json',
			publicPath: paths.buildFolderName,
		})
	],
	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	}
};

addVendors(config);
module.exports = config;
