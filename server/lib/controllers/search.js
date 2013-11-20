var ctrl = require('./controller').create('search'),
	search = require('../models/search');

ctrl.action('index', function(req, res, callback) {
	var term = (req.query.term || '').toLowerCase();
	if(term) {
		search.api_query('/routes/search/' + term).then(function(results) {
			var exact_match;

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
		}, res.internal_error);
	} else {
		callback({});
	}
});

module.exports = ctrl;