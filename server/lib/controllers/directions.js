var ctrl = require('./controller').create('route'),
	directions = require('../models/directions');

ctrl.action('index', function(req, res, callback) {
	var route_id = req.route_id, route = req.route;
	
	directions.where('route_id = ? OR lower(route_short_name) = ?', [route_id, route_id])
		.orders('direction_name')
		.done(function(directions) {
			callback('directions', { title:route.route_short_name, directions:directions });
		});
});

module.exports = ctrl;