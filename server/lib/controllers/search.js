var ctrl = require('./controller').create('search'),
	routes = require('../models/routes');

ctrl.action('index', function(req, res, callback) {
	var term = (req.query.term || '').toLowerCase();

	if(term) {
		var param = term + '%';
		routes.query(req.agency.id)
			.where('agency_id = ? AND (lower(route_short_name) like ? OR lower(route_long_name) like ?)', [req.agency.id, param, param])
			.done(function(results) {
				var exact_match;

				routes.sort_by_short_name(results);
				
				results.forEach(function(route) {
					route.route_short_name_lower = route.route_short_name.toLowerCase();
					route.path = '/' + route.route_type_slug + '/' + route.slug;

					if(route.route_short_name_lower === term || route.route_id.toLowerCase() === term) {
						exact_match = route;
					}
				});

				if(exact_match) {
					res.redirect(exact_match.path);
				} else if(results.length === 1) {
					res.redirect(results[0].path);
				} else {
					callback({ term:term, results:results });
				}
			});
	} else {
		callback({});
	}
});

module.exports = ctrl;