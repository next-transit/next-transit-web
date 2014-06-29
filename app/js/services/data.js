nextsepta.module('nextsepta').service('data', [function() {
	function request(options) {
		var req_settings = $.extend({ dataType:'json' }, options);

		$.ajax(req_settings);
	}

	return {
		get: function(url, success, error) {
			request({ url:url, method:'GET', success:success, error:error });
		},
		get_html: function(url, success, error) {
			request({ url:url, method:'GET', dataType:'html', success:success, error:error });
		},
		post: function(url, data, success, error) {
			request({ url:url, method:'POST', data:data, success:success, error:error });
		}
	};
}]);
