var promise = require('promise'),
	trips = require('./trips'),
	stop_times = require('./stop_times'),
	simplified_stops = require('./simplified_stops'),
	trip_variants = require('./model').create('trip_variants'),
	variant_names = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
	route_variant_lookup = {},
	trip_variant_lookup = {};

function get_variant_name(trip, stop_info) {
	return new promise(function(resolve, reject) {
		var direction_key = [trip.route_id, trip.direction_id].join('-'),
			trip_key = [trip.route_id, trip.direction_id, stop_info.min_sequence, stop_info.max_sequence].join('-'),
			index = 0;

		if(trip_key in trip_variant_lookup) {
			index = trip_variant_lookup[trip_key];
		} else if(direction_key in route_variant_lookup) {
			trip_variant_lookup[trip_key] = route_variant_lookup[direction_key];
			route_variant_lookup[direction_key]++;
		} else {
			route_variant_lookup[direction_key] = 1;
			trip_variant_lookup[trip_key] = 0;
		}

		if(route_variant_lookup[direction_key] > 25) {
			console.log('variant name lookup over 26', trip_key, route_variant_lookup[direction_key])
		}
		resolve(variant_names[trip_variant_lookup[trip_key]] || '?');
	});
}

function get_stop_count(trip) {
	return new promise(function(resolve, reject) {
		simplified_stops.query()
			.select('count(*) as stop_count')
			.where('route_id = ? AND direction_id = ?', [trip.route_id, trip.direction_id])
			.error(reject)
			.first(function(result) {
				resolve(parseInt(result.stop_count, 0) || 0);
			});
	});
}

function get_trip_variant(trip) {
	return new promise(function(resolve, reject) {
		stop_times.query()
			.select('MIN(stop_sequence) as min_sequence, MAX(stop_sequence) as max_sequence')
			.where('trip_id = ?', [trip.trip_id])
			.group_by('trip_id')
			.error(reject)
			.first(function(stop_info) {
				if(stop_info) {
					promise.all([
						get_variant_name(trip, stop_info),
						get_stop_count(trip)
					]).then(function(results) {
						var variant = {
							route_id: trip.route_id,
							direction_id: trip.direction_id,
							trip_headsign: trip.trip_headsign,
							variant_name: results[0],
							stop_count: results[1],
							first_stop_sequence: stop_info.min_sequence,
							last_stop_sequence: stop_info.max_sequence
						};
						resolve(variant);
					}, reject);
				} else {
					resolve();
				}
			});
	});
}

trip_variants.generate_variants = function() {
	return new promise(function(resolve, reject) {
		variant_count_lookup = {};
		trips.all(function(results) {
			var promises = [];
			results.forEach(function(trip) {
				promises.push(get_trip_variant(trip));
			});
			promise.all(promises).then(resolve, reject);
		}, reject);
	});
};

module.exports = trip_variants;