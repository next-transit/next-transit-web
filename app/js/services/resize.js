nextsepta.module('nextsepta').service('resize', [function() {
	var SIZES = {
			mobile: { min:0, max:520 },
			tablet: { min:521, max:960 },
			desktop: { min:961, max:99999 }
		},
		_height = $(window).height(),
		_width = $(window).width(),
		_is = {
			mobile: (_width <= SIZES.mobile.max),
			tablet: (_width >= SIZES.tablet.min && _width <= SIZES.tablet.max),
			desktop: (_width >= SIZES.desktop.min)
		};

	function is_size(size) {
		if(size in SIZES) {
			return _is[size];
		}
	}

	$(window).resize(function(evt) {
		_height = $(window).height();
		_width = $(window).width();
	});

	return {
		height: function() {
			return _height;
		},
		width: function() {
			return _width;
		},
		is: is_size,
		is_mobile: is_size.curry('mobile'),
		is_tablet: is_size.curry('tablet'),
		is_desktop: is_size.curry('desktop')
	};
}]);