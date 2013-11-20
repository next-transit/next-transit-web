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

	function sort_top_results(routes, limit) {
		var center = map_ctrl.map.getCenter(),
			center_point = [center.lat, center.lng],
			route_closest_points = [];

		routes.forEach(function(route) {
			var closest_distance = 9999;

			route.shapes.forEach(function(shape) {
				shape.forEach(function(point) {
					var distance = geo_utils.point_distance(center_point, point);

					if(distance < closest_distance) {
						closest_distance = distance;
					}
				});
			});

			route_closest_points.push({ route:route, closest_distance:closest_distance });
		});

		route_closest_points.sort(function(a, b) {
			return a.closest_distance - b.closest_distance;
		});

		var limited = [], lookup = {}, count = 0;
		route_closest_points.forEach(function(result) {
			if(count < limit && !lookup[result.route.id]) {
				limited.push(result.route);
				lookup[result.route.id] = true;
				count++;
			}
		});

		return limited;
	}

	function highlight_route_shapes(route, over) {
		if(route && route.route_layers) {
			route.route_layers.forEach(function(layer) {
				layer.setStyle({ opacity:over ? 0.9 : 0.45 });	
			});
		}
	}

	function render_routes(routes) {
		$results_list.empty();
		map_ctrl.clear_vectors();

		routes.forEach(function(route) {
			var route_layers = map_ctrl.add_vector(route.shapes, route.color, 0.45);

			if(route_layers) {
				route_layers.forEach(function(layer) {
					layer.on('click', function(evt) {
						history.push('/' + route.route_type_slug + '/' + route.slug);
					}).on('mouseover', function() {
						highlight_route_shapes(route, true);
					}).on('mouseout', function() {
						highlight_route_shapes(route, false);
					});
				});
				route.route_layers = route_layers;
			}
		});

		var sorted_list = sort_top_results(routes, 8);
		sorted_list.forEach(function(route) {
			var $li = $('<li />').appendTo($results_list);
			$('<a href="/' + route.route_type_slug + '/' + route.slug + '" class="js-nav-link">' + route.route_name + '</a>')
				.css('backgroundColor', route.color)
				.appendTo($li)
				.hover(function() {
					highlight_route_shapes(route, true);
				}, function() {
					highlight_route_shapes(route, false);
				});
		});

		$results.show();

		history.parse($results);
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
		// active = true;
		// render_user_location(39.926312796934674, -75.16697645187378);
		// return;

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