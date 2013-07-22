nextsepta.module('templates', []).service('templates', [function() {
	function getTemplate(url, success) {
		$.ajax({
			url: url,
			dataType: 'html',
			success: success
		});
	}

	return {
		'get': getTemplate
	};
}]);