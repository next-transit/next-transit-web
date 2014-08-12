nextsepta.module('nextsepta').controller('home', ['module', 'cookie', 'geo_locate', 'geo_utils', '$elem', 
	function(module, cookie, geo_locate, geo_utils, $elem) {
		function _cookie_val(name) {
			var raw = cookie(name),
				val;

			if(raw) {
				if(raw.indexOf('j:') === 0) {
					raw = raw.replace(/^j:/, '')
				}
				try {
					val = JSON.parse(raw);
				}
				catch(e) {}
			}

			return val;
		}

		function _find_nearest_trip(trips, callback) {
			geo_locate(function(position) {
				var user_point = [position.coords.latitude, position.coords.longitude],
					closest_trip = geo_utils.get_closest_trip(user_point, trips);

				if(closest_trip) {
					callback(closest_trip);
				}
			}, callback);
		}

		function _render(trip) {
			$('a', $recent).attr('href', trip.path);
			$('strong', $recent).addClass(trip.route_type + ' ' + trip.slug).text(trip.route_name);
			$('span', $recent).text(trip.direction_name);
			$recent.addClass('show');
		}

		var trips = _cookie_val('saved_trips') || [],
			recent_trips = _cookie_val('recent_trips') || [],
			$recent = $('.js-home-recent', $elem);

		if(!trips.length) {
			trips = recent_trips;
		}

		if(trips.length) {
			_find_nearest_trip(trips, function(closest_trip) {
				if(closest_trip) {
					_render(closest_trip);
				} else {
					_render(trips[0]);
				}
			});
		}
	}]);
