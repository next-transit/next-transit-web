nextsepta.module('nextsepta').service('cookie', [function() {
	function _startsWith(s, match) {
		return s.indexOf(match) === 0;
	}

	function _set(name, value, options) {
		options = options || {};
		if(value === null) { value = ''; }
		var expires = '';
		if(options.expires) {
			var date;
			if(options.expires.getDate) {
				date = options.expires;
			} else if(typeof options.expires === 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 86400000)); // 8640000 = days (1000 * 60 * 60 * 24)
			}
			if(date) {
				expires = '; expires=' + date.toUTCString();
			}
		}

		var path = options.path ? '; path=' + (options.path) : '',
			domain = options.domain ? '; domain=' + (options.domain) : '',
			secure = options.secure ? '; secure' : '';
		// Write cookie value
		document.cookie = name + '=' + encodeURIComponent(value) + expires + path + domain + secure;
	}

	function _get(name) {
		var val;
		if(document.cookie) {
			var cookies = document.cookie.split(';');
			for(var i = 0, len = cookies.length; i < len; i++) {
				var cookie = $.trim(cookies[i]);
				if(_startsWith(cookie, name + '=')) {
					val = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return val;
	}

	return function cookie(name, value, options) {
		if(typeof value === 'undefined') {
			return _get(name);
		} else {
			_set(name, value, options);
		}
	};
}]);