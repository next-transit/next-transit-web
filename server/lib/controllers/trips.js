var ctrl = require('./controller').create('trips'),
	display_trips = require('../models/display_trips');

function get_day_of_week_num(day) {
	if(day) {
		if(day === 'saturdays') {
			return 6;
		} else if(day === 'sundays') {
			return 0;
		}
		return 1;
	}
}

function get_all_trips_days(day_param) {
	return ['weekdays', 'saturdays', 'sundays'].map(function(day) {
		return {
			val: day,
			label: day[0].toUpperCase() + day.substr(1),
			selected: day === day_param
		};
	});
}

function get_trips(req, res, callback) {
	var route = req.route, 
		direction = req.direction, 
		offset = 0,
		params = {},
		all_trips = req.params.all === 'true',
		view = 'trips/index',
		day_of_week = get_day_of_week_num(req.query.day),
		all_trips_days = get_all_trips_days(req.query.day);

	if(req.query.offset) {
		offset = parseInt(req.query.offset, 10) || 0;
	}
	if(offset) {
		params.offset = offset;
	}
	if(typeof day_of_week === 'number') {
		params.day = day_of_week;
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

	var api_path = '/routes/' + req.route_id + '/directions/' + req.direction_id + '/stops/' + stop_ids;

	api_path += all_trips ? '/all_trips' : '/trips';

	display_trips.api_query(api_path, params).then(function(trips) {
		callback(view, {
			route: route,
			show_realtime: route.has_realtime && !all_trips,
			title: route.route_short_name + ' - ' + direction.direction_name, 
			trips: trips, 
			direction_id_rev: req.direction_id === '0' ? '1' : '0',
			offset_prev: offset_prev, 
			offset_next: offset_next,
			all_trips: all_trips,
			all_trips_days: all_trips_days
		});
	}, res.internal_error);
}

ctrl.action('index', get_trips);

ctrl.action('all', function(req, res, callback) {
	req.params.all = 'true';
	get_trips(req, res, callback);
});

module.exports = ctrl;