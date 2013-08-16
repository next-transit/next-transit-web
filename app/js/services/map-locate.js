nextsepta.module('nextsepta').service('map_locate', ['module', 'data', 'history', 'geo_utils', function(module, data, history, geo_utils) {
	var map_ctrl,
		active = false,
		initialized = false,
		$map,
		$results,
			$results_list;

	function render_user_location(lat, lng) {
		map_ctrl.add_marker(lat, lng);
	}

	function sort_top_results(results, limit) {
		var center = map_ctrl.map.getCenter(),
			center_point = [center.lat, center.lng],
			route_closest_points = [];

		results.forEach(function(result) {
			var closest_distance = 9999;

			result.points.forEach(function(point) {
				var distance = geo_utils.point_distance(center_point, point);

				if(distance < closest_distance) {
					closest_distance = distance;
				}
			});

			route_closest_points.push({ result:result, closest_distance:closest_distance });
		});

		route_closest_points.sort(function(a, b) {
			return a.closest_distance - b.closest_distance;
		});

		var limited = [], count = 0;
		route_closest_points.forEach(function(route) {
			if(count++ < limit) {
				limited.push(route.result);
			}
		});

		return limited;
	}

	function render_routes(results) {
		$results_list.empty();

		results.forEach(function(result) {
			if(result.points.length) {

				var route_layer = map_ctrl.add_vector(result.points, result.color, 0.45 );

				route_layer.on('click', function(evt) {
					history.push('/' + result.route_type_slug + '/' + result.slug);
				}).on('mouseover', function() {
					route_layer.setStyle({ opacity:0.9 });
				}).on('mouseout', function() {
					route_layer.setStyle({ opacity:0.45 });
				});
				result.route_layer = route_layer;
			}
		});

		var sorted_list = sort_top_results(results, 8);
		sorted_list.forEach(function(result) {
			var $li = $('<li />').appendTo($results_list);
			$('<a href="/' + result.route_type_slug + '/' + result.slug + '" class="js-nav-link">' + result.route_name + '</a>')
				.css('backgroundColor', result.color)
				.appendTo($li)
				.hover(function() {
					result.route_layer.setStyle({ opacity:0.9 });
				}, function() {
					result.route_layer.setStyle({ opacity:0.45 });
				});
		});

		$results.show();

		history.eval($results);
	}

	function get_nearby_routes() {
		var bounds = map_ctrl.map.getBounds(),
			bbox = [bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat].join(',');

		data.get('/shapes?bbox=' + bbox, function(resp) {
			if(resp && resp.routes) {
				render_routes(resp.routes);
			}
		});
	}

	function locate() {
		active = true;
		render_user_location(39.926312796934674, -75.16697645187378);
		return;

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				if(position) {
					render_user_location(position.coords.latitude, position.coords.longitude);
				}
			});
		}
	}

	function initialize() {
		if(!initialized) {
			module.on('map-moveend', function() {
				if(active) {
					get_nearby_routes();
				}
			});

			$results = $('<div class="map-results-list"></div>').hide().appendTo($map);
			$results_list = $('<ul></ul>').appendTo($results);

			initialized = true;
		}
	}

	return {
		locate: locate,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;
			$map = $map_elem;

			initialize();
		},
		disable: function() {
			if($results) {
				$results.hide();	
			}
			active = false;
		}
	};
}]);