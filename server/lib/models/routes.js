var model = require('./model'),
	routes = model.create('routes'),
	route_types = require('./route_types');

function pad_left(str, size, char) {
	if(str.length < size) {
		var i = 0, len = size - str.length, pad = '';
		for(; i < len; i++) {
			pad += char;
		}
		str = pad + str;
	}
	return str;
}

function process_route(route) {
	if(route) {
		var route_type = route_types.get_by_id(route.route_type);

		route.is_rail = route.route_type === 2;
		route.has_realtime = route.route_type !== 1;
		route.route_name = route.is_rail ? route.route_id : route.route_short_name;
		route.slug = route.is_rail ? route.route_id.toLowerCase() : route.route_short_name.toLowerCase();
		route.route_type_slug = route_type.slug;
		route.color = route_type.color;
		if(route.route_short_name.toLowerCase() in route_types) {
			route.color = route_types[route.route_short_name.toLowerCase()].color;
		}
		return route;
	}
}

routes.process = function(data, callback) {
	if(data && data.length) {
		data.forEach(function(route) {
			process_route(route);
		});
		callback(data);
	} else if(data) {
		callback(process_route(data));
	}
};

routes.sort_by_short_name = function(routes) {
	routes.sort(function(a, b) {
		a.cid = a.cid || pad_left(a.route_short_name, 4, '0');
		b.cid = b.cid || pad_left(b.route_short_name, 4, '0');

		if(a.cid < b.cid) {
			return -1;
		} else if(a.cid > b.cid) {
			return 1;
		}
		return 0;
	});
};

module.exports = routes;