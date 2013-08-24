var trips = require('./model').create('trips');

trips.get_longest_trip = function(route_id, direction_id, success, error) {
	trips.query()
		.select('trips.id, trips.route_id, trips.trip_id, trips.shape_id, count(st.*) stop_count')
		.join('JOIN stop_times st ON trips.trip_id = st.trip_id')
		.where('trips.direction_id = ? AND trips.route_id = ?', [direction_id, route_id])
		.group_by('trips.id, trips.route_id, trips.trip_id, trips.shape_id')
		.orders('stop_count DESC')
		.error(error)
		.first(success);
};

module.exports = trips;