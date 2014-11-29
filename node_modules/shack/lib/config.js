var utils = require('./utils'),
	exports = {};

exports.read_routes = function(path, verbose) {
	path = path || process.cwd() + '/../config/routes.json';

	var paths = [];

	if(path) {
		paths.push(process.cwd() + '/' + path);
		paths.push(path);
	} else {
		paths.push(process.cwd() + '/config/routes.json');
		paths.push(process.cwd() + '/../config/routes.json');
	}

	var routes = utils.require_file(paths);

	if(!routes && verbose) {
		console.log(('Could not find routes config: ' + path).error);
	}
	return routes;
};

module.exports = exports;
