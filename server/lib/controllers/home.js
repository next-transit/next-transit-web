var route_types = require('../models/route_types'),
	ctrl = require('./controller').create('home');

function filtered_types(all_types) {
	var filtered_types = [];
	all_types.forEach(function(type) {
		if(type.route_type_order >= 0) {
			type.path = '/' + type.slug;
			if(type.parent) {
				type.path = '/' + type.parent + type.path;
			}
			filtered_types.push(type);
		}
	});
	return filtered_types;
}

ctrl.action('index', function(req, res, callback) {
	callback({ route_types:filtered_types(req.route_types) });
});

module.exports = ctrl;
