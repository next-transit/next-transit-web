var ctrl = require('./controller').create('trips'),
	display_trips = require('../models/display_trips');

ctrl.action('index', function(req, res, callback) {
	var route = req.route, 
		direction = req.direction, 
		offset = 0,
		params = {},
		view = 'trips';

	if(req.query.offset) {
		offset = parseInt(req.query.offset, 10) || 0;
	}
	if(offset) {
		params.offset = offset;
	}

	if(req.query.itemsonly === 'true') {
		view = 'partials/trip-item';
	}

	var offset_prev = offset - 5,
		offset_next = offset + 5,
		stop_ids = req.from_stop.stop_id;

	if(req.to_stop) {
		stop_ids += '...' + req.to_stop.stop_id;
	}

	display_trips.api_query('/routes/' + req.route_id + '/directions/' + req.direction_id + '/stops/' + stop_ids + '/trips', params).then(function(trips) {
		callback(view, {
			title: route.route_short_name + ' - ' + direction.direction_name, 
			trips: trips, 
			direction_id_rev: req.direction_id === '0' ? '1' : '0',
			offset_prev: offset_prev, 
			offset_next: offset_next
		});
	}, res.internal_error);
});

module.exports = ctrl;