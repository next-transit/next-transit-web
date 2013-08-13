nextsepta.module('nextsepta').controller('map', ['$elem', function($elem) {
	var $inner = $('.js-map-inner', $elem),
		settings = {
			tiles_url: 'http://api.tiles.mapbox.com/v3/reedlauber.map-55lsrr7u.jsonp',
			center: {
				lat: 39.9523350,
				lng: -75.163789
			},
			zoom: 16
		},
		map;

	function set_center(lat, lng, zoom) {
		lat = lat || settings.center.lat;
		lng = lng || settings.center.lng;
		zoom = zoom || settings.zoom;

		map.setView([39.9523350, -75.163789], zoom);
	}

	function adjust_size() {
		var height = $(window).height() - $('.js-app-header').outerHeight() - $('.js-app-footer').outerHeight();
		$inner.height(height).css('marginTop', $('.js-app-header').outerHeight());
	}

	function initialize_map() {
		adjust_size();

		map = L.mapbox.map($inner.attr('id'), 'reedlauber.map-55lsrr7u');

		set_center();
	}

	if($elem.is(':visible')) {
		initialize_map();
	}
}]);