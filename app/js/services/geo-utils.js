nextsepta.module('nextsepta').service('geo_utils', [function() {
	function number_to_radius(n) {
		return n * Math.PI / 180;
	}

	function point_distance(pt1, pt2) {
		var lat1 = pt1[0],
			lat2 = pt2[0],
			lng1 = pt1[1],
			lng2 = pt2[1],
			r_lat = number_to_radius(lat2 - lat1),
			r_lng = number_to_radius(lng2 - lng1),
			a = Math.pow(Math.sin(r_lat / 2), 2) + 
				Math.cos(number_to_radius(lat1)) * 
				Math.cos(number_to_radius(lat2)) * 
				Math.pow(Math.sin(r_lng / 2), 2),
			b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return (6371 * b) * 1000;
	}

	function get_closest(closest_to, points) {
		var min_distance, distance, closest_point;

		points.forEach(function(point) {
			distance = point_distance(closest_to, point);

			if(typeof min_distance === 'undefined' || distance < min_distance) {
				min_distance = distance;
				closest_point = point;
			}
		});

		return closest_point;
	}

	function get_closest_trip(closest_to, trips) {
		var min_distance, distance, closest_trip;

		trips.forEach(function(trip) {
			if(trip.from_stop_point) {
				distance = point_distance(closest_to, trip.from_stop_point);

				if(typeof min_distance === 'undefined' || distance < min_distance) {
					min_distance = distance;
					closest_trip = trip;
				}
			}
		});

		return closest_trip;
	}

	return {
		point_distance: point_distance,
		get_closest: get_closest,
		get_closest_trip: get_closest_trip
	};
}]);
