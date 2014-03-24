nextsepta.module('nextsepta').service('map_routes', ['module', 'data', 'history', 'geo_utils', function(module, data, history, geo_utils) {
	var map_ctrl,
		active = false,
		initialized = false,
		stops_min_zoom_level = 15,
		$map,
		$results,
			$results_list;

	function sort_top_results(routes, limit) {
		var center = map_ctrl.map.getCenter(),
			center_point = [center.lat, center.lng],
			route_closest_points = [];

		routes.forEach(function(route) {
			var closest_distance = 9999;

			route.paths.forEach(function(shape) {
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

	// Sort routes by distance for routes menu list
	function render_sorted_routes_menu(routes) {
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
	}

	function highlight_point_shape(layer, over) {
		layer.setStyle({ opacity:over ? 0.9 : 0.45 });	
	}

	function highlight_route_shapes(route, over) {
		if(route && route.path_layers) {
			route.path_layers.forEach(function(layer) {
				highlight_point_shape(layer, over);
			});
		}
	}

	function simplify_stops(stop_results) {
		var stop_points = [];
		stop_results.forEach(function(stop) {
			stop_points.push({ data:{ direction_id:stop.direction_id, stop_id:stop.stop_id }, shape:[stop.stop_lat, stop.stop_lon] });
		});
		return stop_points;
	}

	function bind_layer_events(layer, url, hover_fn, hover_data) {
		layer.on('click', function(evt) {
			history.push(url);
		}).on('mouseover', function() {
			hover_fn(hover_data, true);
		}).on('mouseout', function() {
			hover_fn(hover_data, false);
		});
	}

	function render_routes(routes, show_routes_menu, show_stops) {
		$results_list.empty();
		map_ctrl.clear_vectors();

		routes.forEach(function(route) {
			// Render Route paths
			if(route.paths) {
				route.path_layers = map_ctrl.add_vector(route.paths, route.color, 0.45);

				route.path_layers.forEach(function(layer) {
					bind_layer_events(layer, '/' + route.route_type_slug + '/' + route.slug, highlight_route_shapes, route);
				});
			}

			// Render Stop points
			if(route.stops) {
				route.point_layers = map_ctrl.add_vector_points(simplify_stops(route.stops), route.color, 0.45);

				route.point_layers.forEach(function(layer) {
					bind_layer_events(layer, '/' + route.route_type_slug + '/' + route.slug + '/' + layer.data.direction_id + '/' + layer.data.stop_id, highlight_point_shape, layer);
				});
			}
		});

		if(show_routes_menu) {
			render_sorted_routes_menu(routes);

			$results.show();

			history.parse($results);
		}
	}

	function add_viewport_routes(show_routes_menu, show_stops) {
		var bounds = map_ctrl.map.getBounds(),
			bbox = [bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat].join(',');

		data.get('/shapes?bbox=' + bbox + '&stops=' + !!show_stops, function(resp) {
			if(resp && resp.routes) {
				render_routes(resp.routes, show_routes_menu, show_stops);
			}
		});
	}

	function get_nearby() {
		add_viewport_routes(true, true);
	}

	function add_all_routes() {
		add_viewport_routes();
	}

	function add_route(route_type, route_id, fit_to_route) {
		data.get(['', route_type, route_id, 'shape'].join('/'), function(route) {
			render_routes([route]);
			if(fit_to_route) {
				map_ctrl.fit_to_last_path();
			}
		});
	}

	function initialize() {
		if(!initialized) {
			module.on('map-moveend', function() {
				if(active) {
					get_nearby();
				}
			});

			$results = $('<div class="map-results-list"></div>').hide().appendTo($map);
			$results_list = $('<ul></ul>').appendTo($results);

			initialized = true;
		}
	}

	return {
		add: add_route,
		add_all: add_all_routes,
		nearby: get_nearby,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;
			$map = $map_elem;

			initialize();
		},
		enable: function() {
			active = true;
		},
		disable: function() {
			if($results) {
				$results.hide();	
			}
			active = false;
		}
	};
}]);
