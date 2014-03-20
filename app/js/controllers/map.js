nextsepta.module('nextsepta').controller('map', ['module', 'data', 'map_locate', 'map_vehicles', 'map_markers', 'map_vectors', '$elem', 
	function(module, data, locate, vehicles, markers, vectors, $elem) {
		var $inner = $('.js-map-inner', $elem),
			settings = {
				tiles_id: 'reedlauber.map-55lsrr7u',
				retina_tiles_id: 'reedlauber.map-1j4vhxof',
				centers: {
					septa: {
						lat:  39.9523350,
						lng: -75.163789,
						zoom: 16
					}, trimet: {
						lat:  45.5197293,
						lng: -122.673683,
						zoom: 15
					}
				}
			},
			initialized = false,
			self = {},
			map,
			routes_layer;

		function set_center(lat, lng, zoom) {
			var center = settings.centers[module.data('agency-slug')] || settings.centers.septa;
			lat = lat || center.lat;
			lng = lng || center.lng;
			zoom = zoom || center.zoom;

			self.map.setView([lat, lng], zoom);
		}

		function adjust_size() {
			var height = $(window).height() - $('.js-app-header').outerHeight() - $('.js-app-footer').outerHeight();
			$inner.height(height);
			$elem.css('top', $('.js-app-header').outerHeight());
		}

		function initialize_map() {
			if(!initialized && $elem.is(':visible')) {
				adjust_size();

				self.map = window.MAP = L.mapbox.map($inner.attr('id'), settings.tiles_id, {
					detectRetina: true,
					retinaVersion: settings.retina_tiles_id
				});

				self.map.on('moveend', function() {
					module.emit('map-moveend', []);
				});

				markers.set_map_ctrl(self, $elem);
				vectors.set_map_ctrl(self, $elem);
				locate.set_map_ctrl(self, $elem);
				vehicles.set_map_ctrl(self, $elem);

				set_center();

				initialized = true;
			}
		}

		module.on('content-settings-changed', function(evt, settings) {
			if(settings.map) {
				initialize_map();

				markers.clear();
				vectors.clear();
				locate.disable();
				vehicles.disable();

				if(settings.map_locate) {
					locate.locate();
				}

				if(settings.route_type && settings.route_id) {
					vectors.add_route(settings.route_type, settings.route_id, !settings.map_vehicle);
					if(settings.has_realtime) {
						vehicles.add_vehicles(settings.route_type, settings.route_id, settings.map_vehicle);	
					}
				} else {
					vectors.add_all_routes();
				}
			} else {
				locate.disable();
				vehicles.disable();
			}
		});

		self.set_center = set_center;
		self.add_marker = markers.add;
		self.move_marker = markers.move;
		self.remove_marker = markers.remove;
		self.clear_markers = markers.clear;
		self.add_vector = vectors.add;
		self.clear_vectors = vectors.clear;
	}
]);
