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

	function add_shape(points, color, opacity) {
		return L.polyline(points, {
			color: color || '#a33', 
			opacity: opacity || 0.65
		}).addTo(layer_group);
	}

	function add_route(route_type, route_id, fit_to_route) {
		data.get(['', route_type, route_id, 'shape'].join('/'), function(resp) {
			add_shape(resp.points);
			if(fit_to_route) {
				fit_to_last();	
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
		add: add_shape,
		add_route: add_route,
		clear: clear_layers,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;

			initialize();
		}
	};
}]);