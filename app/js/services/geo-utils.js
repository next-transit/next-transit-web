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

	return {
		point_distance: point_distance
	};
}]);