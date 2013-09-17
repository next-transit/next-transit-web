nextsepta.module('nextsepta').service('map_markers', [function() {
	var initialized = false,
		layer_group,
		icons = {},
		markers = {};

	function get_marker_icon(icon_name) {
		icon_name = icon_name || 'marker-36';
		
		if(!(icon_name in icons)) {
			icons[icon_name] = L.icon({
				iconUrl: '/images/maki/' + icon_name + '.png',
				iconRetinaUrl: '/images/maki/' + icon_name + '@2x.png',
				iconSize: [32, 32],
				iconAnchor: [16, 16]
			});
		}

		return icons[icon_name];
	}

	function add_marker(lat, lng, options) {
		options = $.extend({
			id: '',
			icon: '',
			title: 'Location',
			zoom: 17,
			center: true,
			message: ''
		}, options);

		var marker = L.marker([lat, lng], {
			icon: get_marker_icon(options.icon),
			title: options.title || 'Marker'
		}).addTo(layer_group);

		if(options.message) {
			var popup = L.popup({
				autoPan: false,
				closeButton: false,
				offset: [52, 10]
			});
			popup.setLatLng([lat, lng]);
			popup.setContent('<div class="map-marker-info">' + options.message + '</div>');
			map_ctrl.map.addLayer(popup);
		}

		if(options.id) {
			markers[options.id] = marker;
		}

		if(options.center) {
			map_ctrl.set_center(lat, lng, options.zoom);	
		}

		return marker;
	}

	function move_marker(id, lat, lng, center) {
		if(id in markers) {
			markers[id].setLatLng([lat, lng]).update();
			if(center) {
				map_ctrl.set_center(lat, lng, map_ctrl.map.getZoom());
			}
		}
	}

	function remove_marker(id) {
		if(id in markers) {
			layer_group.removeLayer(markers[id]);
		}
	}

	function clear_markers() {
		layer_group.clearLayers();
		markers = {};
	}

	function initialize() {
		if(!initialized) {
			layer_group = L.layerGroup().addTo(map_ctrl.map);

			initialized = true;
		}
	}

	return {
		add: add_marker,
		move: move_marker,
		remove: remove_marker,
		clear: clear_markers,
		set_map_ctrl: function(ctrl) {
			map_ctrl = ctrl;

			initialize();
		}
	};
}]);