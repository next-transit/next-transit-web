nextsepta.module('nextsepta').controller('map', ['module', 'data', 'map_locate', '$elem', function(module, data, locate, $elem) {
	var $inner = $('.js-map-inner', $elem),
		settings = {
			tiles_url: 'http://api.tiles.mapbox.com/v3/reedlauber.map-55lsrr7u.jsonp',
			center: {
				lat: 39.9523350,
				lng: -75.163789
			},
			zoom: 16
		},
		initialized = false,
		self = {},
		map,
		marker_layer,
		routes_layer;

	function set_center(lat, lng, zoom) {
		lat = lat || settings.center.lat;
		lng = lng || settings.center.lng;
		zoom = zoom || settings.zoom;

		self.map.setView([lat, lng], zoom);
	}

	function get_marker_icon() {
		return L.icon({
			iconUrl: '/images/maki/marker-24.png',
			iconRetinaUrl: '/images/maki/marker-24@2x.png',
			iconSize: [24, 24],
			iconAnchor: [12, 24]
		});
	}

	function add_marker(lat, lng) {
		L.marker([lat, lng], {
			icon: get_marker_icon(),
			clickable: false,
			title: 'Your location'
		}).addTo(self.map);
	}

	function get_route_shape(route_type, route_id) {
		data.get(['', route_type, route_id, 'shape'].join('/'), function(resp) {
			var route_layer = L.polyline(resp.points, { color:'#a33', opacity: 0.65 });
			routes_layer.addLayer(route_layer);
			self.map.fitBounds(route_layer.getBounds());
		});
	}

	function adjust_size() {
		var height = $(window).height() - $('.js-app-header').outerHeight() - $('.js-app-footer').outerHeight();
		$inner.height(height).css('marginTop', $('.js-app-header').outerHeight());
	}

	function initialize_map() {
		if(!initialized && $elem.is(':visible')) {
			adjust_size();

			self.map = window.MAP = L.mapbox.map($inner.attr('id'), 'reedlauber.map-55lsrr7u');

			self.map.on('moveend', function() {
				module.emit('map-moveend', []);
			});

			locate.set_map_ctrl(self, $elem);

			set_center();

			initialized = true;
		}
	}

	module.on('content-settings-changed', function(evt, settings) {
		if(settings.map) {
			initialize_map();

			if(settings.map_locate) {
				locate.locate();
			}

			if(settings.route_type && settings.route_id) {
				get_route_shape(settings.route_type, settings.route_id);
			}
		}
	});

	self.set_center = set_center;
	self.add_marker = add_marker;
}]);