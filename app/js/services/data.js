nextsepta.module('nextsepta').service('data', [function() {
	function request(options) {
		var req_settings = $.extend({ dataType:'json' }, options);

		$.ajax(req_settings);
	}

	return {
		get: function(url, success, error) {
			request({ url:url, method:'GET', success:success, error:error });
		}
	};
}]);