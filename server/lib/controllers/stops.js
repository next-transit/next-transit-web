var ctrl = require('./controller').create('stops'),
	simplified_stops = require('../models/simplified_stops');

ctrl.action('from', function(req, res, callback) {
	var route = req.route,
		route_id = req.route_id.toLowerCase(),
		direction = req.direction;

	simplified_stops.api_query('/routes/' + route_id + '/directions/' + direction.direction_id + '/stops').then(function(results) {
		results.forEach(function(stop) {
			stop.path = stop.stop_id;
		});
		callback('stops/index', {
			title: route.route_short_name + ' - ' + direction.direction_name,
			stops: results
		});
	}, res.internal_error);
});

ctrl.action('to', function(req, res, callback) {
	var route = req.route, 
		route_id = req.route_id.toLowerCase(),
		direction = req.direction, 
		from = req.from_stop;

	simplified_stops.api_query('/routes/' + route_id + '/directions/' + direction.direction_id + '/stops', { min_sequence:from.stop_sequence }).then(function(results) {
		results.forEach(function(stop) {
			stop.path = from.stop_id + '/' + stop.stop_id;
		});
		callback('stops/index', {
			title: route.route_short_name + ' - ' + direction.direction_name,
			stops: results
		});
	}, res.internal_error);
});

module.exports = ctrl;