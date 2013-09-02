var promise = require('promise'),
	model = require('./model'),
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

function process_route(agency_id, route) {
	return new promise(function(resolve, reject) {
		if(route) {
			var custom_type_slug = route.route_short_name.toLowerCase();
			
			route_types.get_by_route_type_id(agency_id, route.route_type, custom_type_slug, function(route_type, custom_route_type) {
				route.is_rail = route.route_type === 2;
				route.has_realtime = route.route_type !== 1;
				route.route_name = route.is_rail ? route.route_id : route.route_short_name;
				route.slug = route.is_rail ? route.route_id.toLowerCase() : route.route_short_name.toLowerCase();
				route.route_type_slug = route_type.slug;
				route.color = route_type.color;

				if(custom_route_type) {
					route.color = custom_route_type.color;
				}
				resolve(route);
			});
		} else {
			resolve(route);
		}
	});
}

routes.process = function(agency_id, data, callback) {
	if(data && data.length) {
		var promises = [];
		data.forEach(function(route) {
			promises.push(process_route(agency_id, route));
		});
		promise.all(promises).then(callback, function(err) {
			console.log('Error processing routes', err);
		});
	} else if(data) {
		process_route(agency_id, data).then(callback, function(err) {
			console.log('Error processing routes', err);
		});
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