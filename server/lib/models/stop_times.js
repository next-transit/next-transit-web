var date = require('../util/date'),
	promise = require('promise'),
	stop_times = require('./model').create('stop_times');

var SERVICE_IDS_BUS = ['7', '1', '1', '1', '1', '1', '5'],
	SERVICE_IDS_RAIL = ['S3', 'S1', 'S1', 'S1', 'S1', 'S1', 'S2'],
	TIME_FORMAT = 'HH24:MI:SS';

stop_times.get_by_time = function(agency_id, is_rail, route_id, direction_id, from_id, offset, success, error) {
	var now = date().add({ minutes:-5 }),
		service = is_rail ? SERVICE_IDS_RAIL : SERVICE_IDS_BUS,
		service_id = service[now.getDay()],
		sort_dir = 'asc',
		compare_dir = '>',
		compare_time = now.toFormat(TIME_FORMAT);

	var hour = now.getHours();
	if(hour < 5) {
		compare_time = now.toFormat((hour + 24) + ':MI:SS');
	}

	// handles "backwards" paging
	// if a negative offset is detected, we reverse the time comparison, reverse the sort order, and then reverse the results
	if(offset) {
		if(offset < 0) {
			offset += 5; // this is because an offset of -5 actually means reverse order and start from 0
			sort_dir = 'desc';
			compare_dir = '<';
		}
	}

	stop_times.query()
		.select('distinct stop_times.*, t.block_id, tv.stop_count, tv.first_stop_sequence, tv.last_stop_sequence')
		.join('join trips t ON stop_times.trip_id = t.trip_id AND t.agency_id = ?')
		.join('left outer join trip_variants tv ON t.trip_variant_id = tv.id')
		.where('stop_times.agency_id = ? AND t.route_id = ? AND stop_id = ? AND t.direction_id = ? AND service_id = ? AND departure_time ' + compare_dir + ' ?')
		.params([agency_id, agency_id, route_id, from_id, direction_id, service_id, compare_time])
		.orders('departure_time ' + sort_dir)
		.limit(5)
		.offset(Math.abs(offset))
		.done(function(times) {
			if(sort_dir === 'desc') {
				times.reverse();
			}
			success(times);
		});
};

module.exports = stop_times;