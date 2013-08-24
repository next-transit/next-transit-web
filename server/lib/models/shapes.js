var promise = require('promise'),
	routes = require('./routes'),
	trips = require('./trips'),
	shapes = require('./model').create('shapes')

function assign_route_shapes(route) {
	return new promise(function(resolve, reject) {
		var route_id = route.route_id,
			route_pub_id = route.route_name;

		trips.get_longest_trip(route.route_id, 0, function(longest_trip) {
			if(longest_trip) {
				console.log('Setting Shape for Route ' + route_pub_id + ' with Trip/Shape: ' + longest_trip.trip_id + '/' + longest_trip.shape_id);

				shapes.update()
					.error(reject)
					.set('route_id = ?', [route_pub_id])
					.where('shape_id = ?', [longest_trip.shape_id])
					.commit(resolve);
			}
		}, reject);
	});
}

shapes.assign_route_shapes = function() {
	return new promise(function(resolve, reject) {
		routes.all(function(rts) {
			var promises = [];
			rts.forEach(function(route) {
				promises.push(assign_route_shapes(route));
			});
			promise.all(promises).then(resolve, reject);
		});
	});
};

module.exports = shapes;