var route_types = require('../models/route_types'),
	home = require('./controller').create('home');

home.action('index', function(req, res, callback) {
	route_types.get_by_agency_id(req.agency.id, function(types) {
		var filtered_types = [];
		types.forEach(function(type) {
			if(type.route_type_order >= 0) {
				filtered_types.push(type);
			}
		});
		callback({ route_types:filtered_types });
	});
});

module.exports = home;