nextsepta.module('nextsepta').service('map_locate', ['module', function(module) {
	var map_ctrl;

	function render_user_location(lat, lng) {
		map_ctrl.add_marker(lat, lng);
	}

	function locate() {
		active = true;
		// render_user_location(39.926312796934674, -75.16697645187378);
		// return;

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				if(position) {
					render_user_location(position.coords.latitude, position.coords.longitude);
				}
			});
		}
	}

	return {
		locate: locate,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;
		}
	};
}]);