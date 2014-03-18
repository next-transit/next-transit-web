var http = require('http'),
	promise = require('promise'),
	realtime = {};

realtime.request = function request(url) {
	return new promise(function(resolve, reject) {
		http.get(url, function(res) {
			res.setEncoding('utf8');

			var data = '';
			res.on('data', function(chunk) {
				data += chunk;
			}).on('end', function() {
				var data_obj = JSON.parse(data);
				
				resolve(data_obj);
			});
		}).on('error', function(err) {
			reject(err);
		});
	});
}

module.exports = realtime;
