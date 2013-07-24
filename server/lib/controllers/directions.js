var ctrl = require('./controller').create('directions'),
	directions = require('../models/directions');

ctrl.action('index', function(req, res, callback) {
	var route_id = req.route_id.toLowerCase(), route = req.route;
	console.log(route_id)
	
	directions.where('lower(route_id) = ? OR lower(route_short_name) = ?', [route_id, route_id])
		.orders('direction_name')
		.done(function(directions) {
			callback({ title:route.route_short_name, directions:directions });
		});
});

module.exports = ctrl;