nextsepta.module('nextsepta').service('geo_locate', [function() {
	return function(callback, nope) {
		callback = callback || nextsepta.noop;
		nope = nope || nextsepta.noop;

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				if(position) {
					callback(position);
				} else {
					nope();
				}
			});
		} else {
			nope();
		}
	};
}]);
