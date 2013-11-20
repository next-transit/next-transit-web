var ctrl = require('./controller').create('routes'),
	routes = require('../models/routes');

ctrl.action('index', function(req, res, success) {
	routes.api_query('/route_types/' + req.route_type_slug + '/routes').then(function(results) {
		success({ title:req.route_type.label, routes:results });
	}, res.internal_error);
});

module.exports = ctrl;