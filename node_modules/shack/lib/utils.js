var exports = {};

function require_file(paths, current) {
	current = current || 0;
	var path = paths[current];
	try {
		return require(path);
	}
	catch(e) {
		if(current < paths.length) {
			return require_file(paths, ++current);
		}
	}
}

exports.require_file = require_file;

module.exports = exports;
