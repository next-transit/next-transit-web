var ctrl = require('./controller').create('direction'),
	simplified_stops = require('../models/simplified_stops');

ctrl.action('from', function(req, res, callback) {
	var route = req.route, direction = req.direction;

	simplified_stops.where('route_id = ? AND direction_id = ?', [route.route_id, direction.direction_id]).done(function(stops) {
		stops.forEach(function(stop) {
			stop.path = stop.stop_id;
		});
		callback('stops', { title:route.route_short_name + ' - ' + direction.direction_name, stops:stops });
	});
});

ctrl.action('to', function(req, res, callback) {
	var route = req.route, direction = req.direction, from = req.from_stop;

	simplified_stops.where('route_id = ? AND direction_id = ? AND stop_sequence > ?', [route.route_id, direction.direction_id, from.stop_sequence]).done(function(stops) {
		stops.forEach(function(stop) {
			stop.path = from.stop_id + '/' + stop.stop_id;
		});
		callback('stops', { title:route.route_short_name + ' - ' + direction.direction_name, from_stop:from, stops:stops });
	});
});

module.exports = ctrl;