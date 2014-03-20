nextsepta.module('nextsepta').service('map_vectors', ['data', function(data) {
	var initialized = false,
		map_ctrl,
		layer_group;

	function fit_to_last() {
		var layers = layer_group.getLayers();
		if(layers.length) {
			map_ctrl.map.fitBounds(layers[layers.length-1].getBounds());
		}
	}

	function add_shapes(shapes, color, opacity) {
		var layers = [];
		shapes.forEach(function(shape) {
			layers.push(L.polyline(shape, {
				color: color || '#a33', 
				opacity: opacity || 0.65
			}).addTo(layer_group));
		});
		return layers;
	}

	function add_route(route_type, route_id, fit_to_route) {
		data.get(['', route_type, route_id, 'shape'].join('/'), function(resp) {
			add_shapes(resp.shapes, resp.color);
			if(fit_to_route) {
				fit_to_last();
			}
		});
	}

	function add_all_routes() {
		var bounds = map_ctrl.map.getBounds(),
			bbox = [bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat].join(',');

		data.get('/shapes?bbox=' + bbox, function(resp) {
			if(resp && resp.routes) {
				resp.routes.forEach(function(route) {
					add_shapes(route.shapes, route.color);
				});
			}
		});
	}

	function clear_layers() {
		layer_group.clearLayers();
	}

	function initialize() {
		if(!initialized) {
			layer_group = L.layerGroup().addTo(map_ctrl.map);

			initialized = true;
		}
	}

	return {
		add: add_shapes,
		add_route: add_route,
		add_all_routes: add_all_routes,
		clear: clear_layers,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;

			initialize();
		}
	};
}]);