nextsepta.module('nextsepta').controller('map', ['module', 'data', '$elem', function(module, data, $elem) {
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
		map,
		routes_layer;

	function set_center(lat, lng, zoom) {
		lat = lat || settings.center.lat;
		lng = lng || settings.center.lng;
		zoom = zoom || settings.zoom;

		map.setView([lat, lng], zoom);
	}

	function get_routes_layer(callback) {
		if(routes_layer) {
			callback(routes_layer);
		} else {
			routes_layer = L.multiPolyline([], { color:'#a33', opacity: 0.65 }).addTo(map);
			callback(routes_layer);
		}
	}

	function get_route_shape(route_type, route_id) {
		data.get(['', route_type, route_id, 'shape'].join('/'), function(resp) {
			get_routes_layer(function(routes_layer) {
				routes_layer.setLatLngs([resp.shapes]);
				map.fitBounds(routes_layer.getBounds());
			});
		});
	}

	function adjust_size() {
		var height = $(window).height() - $('.js-app-header').outerHeight() - $('.js-app-footer').outerHeight();
		$inner.height(height).css('marginTop', $('.js-app-header').outerHeight());
	}

	function initialize_map() {
		if(!initialized && $elem.is(':visible')) {
			adjust_size();

			map = L.mapbox.map($inner.attr('id'), 'reedlauber.map-55lsrr7u');

			set_center();

			initialized = true;
		}
	}

	module.on('content-settings-changed', function(evt, settings) {
		if(settings.map) {
			initialize_map();

			if(settings.map_locate && navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					if(position) {
						set_center(position.coords.latitude, position.coords.longitude, 17);
					}
				});
			}

			if(settings.route_type && settings.route_id) {
				get_route_shape(settings.route_type, settings.route_id);
			}
		}
	});
}]);