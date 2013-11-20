var ctrl = require('./controller').create('directions'),
	directions = require('../models/directions');

ctrl.action('index', function(req, res, callback) {
	var route_id = req.route_id.toLowerCase(), route = req.route;

	directions.api_query('/routes/' + route_id + '/directions').then(function(results) {
		callback({ title:route.route_short_name, directions:results });
	}, res.internal_error);
});

module.exports = ctrl;