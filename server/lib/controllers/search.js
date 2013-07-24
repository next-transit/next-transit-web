var ctrl = require('./controller').create('search'),
	route_types = require('../models/route_types'),
	routes = require('../models/routes');

ctrl.action('index', function(req, res, callback) {
	var term = (req.query.term || '').toLowerCase();

	if(term) {
		var param = term + '%';
		routes.query().where('lower(route_short_name) like ? OR lower(route_long_name) like ?', [param, param]).done(function(routes) {
			var exact_match;

			routes.forEach(function(route) {
				route.route_type_name = (route_types.get_by_id(route.route_type) || {}).slug;
				route.route_short_name_lower = route.route_short_name.toLowerCase();
				route.path = '/' + route.route_type_name + '/' + route.route_short_name_lower;

				if(route.route_short_name_lower === term) {
					exact_match = route;
				}
			});
			if(exact_match) {
				res.redirect(exact_match.path);
			} else if(routes.length === 1) {
				res.redirect(routes[0].path);
			} else {
				callback({ term:term, results:routes });
			}
		});
	} else {
		callback({});
	}
});

module.exports = ctrl;