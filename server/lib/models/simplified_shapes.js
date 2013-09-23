var promise = require('promise'),
	routes = require('./routes'),
	trips = require('./trips'),
	shapes = require('./shapes'),
	simplified_shapes = require('./model').create('simplified_shapes'),
	verbose = false;

function get_longest_trip_shape(agency_id, route, direction_id) {
	return new promise(function(resolve, reject) {
		trips.get_longest_trip(agency_id, route.route_id, direction_id, function(longest_trip) {
			if(longest_trip) {
				if(verbose) {
					console.log('Getting Shapes for Route ' + route.route_name + ' with Trip/Shape: ' + longest_trip.trip_id + '/' + longest_trip.shape_id + '/' + direction_id);	
				}
				shapes.query()
					.where('agency_id = ? AND shape_id = ?', [agency_id, longest_trip.shape_id])
					.orders('shape_pt_sequence')
					.error(reject)
					.done(function(points) {
						var shape = [];
						points.forEach(function(point) {
							shape.push({
								agency_id: agency_id,
								route_id: route.route_id,
								segment_id: direction_id, // simple for now (leaves room for more incremental segments in the future as needed)
								shape_id: point.shape_id,
								shape_pt_lat: point.shape_pt_lat,
								shape_pt_lon: point.shape_pt_lon
							});
						});
						resolve(shape);
					});
			} else {
				if(verbose) {
					console.log('Couldn\'t find longest trip for route', route.route_short_name, direction_id);
				}
				resolve([]);
			}
		}, reject);
	});
}

function get_longest_trip_shapes(agency_id, route) {
	return new promise(function(resolve, reject) {
		var trip_promises = [
			get_longest_trip_shape(agency_id, route, 0),
			get_longest_trip_shape(agency_id, route, 1)
		];
		promise.all(trip_promises).then(function(trip_shapes) {
			var all_shapes = trip_shapes[0].concat(trip_shapes[1]);
			resolve(all_shapes);
		}, reject);
	});
}

simplified_shapes.generate_route_shapes = function(agency_id, vrbse) {
	return new promise(function(resolve, reject) {
		verbose = vrbse;

		routes
			.query(agency_id)
			.where('agency_id = ?', [agency_id])
			.done(function(rts) {
				var promises = [];
				rts.forEach(function(route) {
					promises.push(get_longest_trip_shapes(agency_id, route));
				});
				promise.all(promises).then(function(route_shapes) {
					var all_shapes = [];
					route_shapes.forEach(function(route_shape) {
						all_shapes = all_shapes.concat(route_shape);
					});
					resolve(all_shapes);
				}, reject);
			});
	});
};

module.exports = simplified_shapes;