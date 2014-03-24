nextsepta.module('nextsepta').service('map_vectors', ['module', 'data', function(module, data) {
	var initialized = false,
		map_ctrl,
		points_min_zoom_level = 15,
		paths_layer_group,
		points_layer_group,
		point_layers = [],
		points_hidden = false;

	function fit_to_last_path() {
		var layers = paths_layer_group.getLayers();
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
			}).addTo(paths_layer_group));
		});
		return layers;
	}

	function add_points(points, color, opacity) {
		point_layers = [];
		points.forEach(function(point) {
			var marker = L.circleMarker(point.shape, {
				color: color || '#3a3',
				fillColor: '#fff',
				opacity: (opacity + 0.2) || 0.85,
				fillOpacity: opacity || 0.65,
				radius: 7,
				weight: 5
			});
			marker.data = point.data;
			point_layers.push(marker);

			if(map_ctrl.map.getZoom() >= points_min_zoom_level) {
				marker.addTo(points_layer_group);
			}
		});
		return point_layers;
	}

	function clear_layers() {
		paths_layer_group.clearLayers();
		points_layer_group.clearLayers();
	}

	function initialize() {
		if(!initialized) {
			paths_layer_group = L.layerGroup().addTo(map_ctrl.map);
			points_layer_group = L.layerGroup().addTo(map_ctrl.map);

			module.on('map-moveend', function() {
				// Remove/add layers. Kind of a nasty workaround since Leaflet doesn't have show/hide
				if(map_ctrl.map.getZoom() >= points_min_zoom_level) {
					if(points_hidden) {
						point_layers.forEach(function(layer) {
							points_layer_group.addLayer(layer);
						});
						points_hidden = false;
					}
				} else if(!points_hidden) {
					point_layers.forEach(function(layer) {
						points_layer_group.removeLayer(layer);
					});
					points_hidden = true;
				}
			});

			initialized = true;
		}
	}

	return {
		add: add_shapes,
		add_points: add_points,
		fit_to_last_path: fit_to_last_path,
		clear: clear_layers,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;

			initialize();
		}
	};
}]);
