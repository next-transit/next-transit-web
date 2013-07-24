var model = require('./model'),
	routes = model.create('routes');

function padLeft(str, size, char) {
	if(str.length < size) {
		var i = 0, len = size - str.length, pad = '';
		for(; i < len; i++) {
			pad += char;
		}
		str = pad + str;
	}
	return str;
}

function processRoute(route) {
	route.is_rail = route.route_type === 2;
	route.has_realtime = route.route_type !== 1;
	route.slug = route.is_rail ? route.route_id.toLowerCase() : route.route_short_name.toLowerCase();
	return route;
}

routes.process = function(data, callback) {
	if(data && data.length) {
		data.forEach(function(route) {
			processRoute(route);
		});
		callback(data);
	} else if(data) {
		callback(processRoute(data));
	}
};

routes.sort_by_short_name = function(routes) {
	routes.sort(function(a, b) {
		a.cid = a.cid || padLeft(a.route_short_name, 4, '0');
		b.cid = b.cid || padLeft(b.route_short_name, 4, '0');

		if(a.cid < b.cid) {
			return -1;
		} else if(a.cid > b.cid) {
			return 1;
		}
		return 0;
	});
};

module.exports = routes;