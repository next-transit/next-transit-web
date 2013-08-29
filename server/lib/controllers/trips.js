var ctrl = require('./controller').create('trips'),
	display_trips = require('../models/display_trips');

ctrl.action('index', function(req, res, callback) {
	var route = req.route, 
		direction = req.direction, 
		offset = 0,
		view = 'trips';

	if(req.query.offset) {
		offset = parseInt(req.query.offset, 10) || 0;
	}
	if(req.query.itemsonly === 'true') {
		view = 'partials/trip-item';
	}

	var offset_prev = offset - 5,
		offset_next = offset + 5;

	display_trips.get_by_time(req.agency.id, req.route.is_rail, req.route.route_id, req.direction_id, req.from_stop.stop_id, offset, req.to_stop, function(trips) {
		callback(view, {
			title: route.route_short_name + ' - ' + direction.direction_name, 
			trips: trips, 
			direction_id_rev: req.direction_id === '0' ? '1' : '0',
			offset_prev: offset_prev, 
			offset_next: offset_next
		});
	});
});

module.exports = ctrl;