var ctrl = require('./controller').create('from'),
	display_trips = require('../models/display_trips');

ctrl.action('index', function(req, res, callback) {
	var route = req.route, direction = req.direction;
	display_trips.get_by_time(req.route.is_rail, req.route.route_id, req.direction_id, req.from_stop.stop_id, req.params.offset, req.to_stop, function(trips) {
		callback('trips', { title:route.route_short_name + ' - ' + direction.direction_name, trips:trips });
	});
});

module.exports = ctrl;