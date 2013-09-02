var route_types = require('./model').create('route_types'),
	cache = {};

route_types.get_by_agency_id = function(agency_id, callback) {
	if(agency_id in cache) {
		callback(cache[agency_id]);
	} else {
		route_types.query()
			.where('agency_id = ?', [agency_id])
			.orders('route_type_order')
			.done(function(results) {
				results.forEach(function(route_type) {
					route_type.path = '/' + (route_type.parent ? route_type.parent + '/' : '') + route_type.slug;
				});
				cache[agency_id] = results;
				callback(results);
			});
	}
};

route_types.get_by_route_type_id = function(agency_id, route_type_id, custom_slug, callback) {
	route_types.get_by_agency_id(agency_id, function(types) {
		var route_type,
			custom_route_type;

		types.forEach(function(type) {
			if(type.route_type_id == route_type_id) {
				route_type = type;
			}
			if(custom_slug && custom_slug === type.slug) {
				custom_route_type = type;
			}
		});
		callback(route_type, custom_route_type);
	});
};

route_types.get_by_slug = function(agency_id, slug, callback) {
	route_types.get_by_agency_id(agency_id, function(types) {
		var route_type;
		types.forEach(function(type) {
			if(slug === type.slug) {
				route_type = type;
			}
		});
		callback(route_type);
	});
};

module.exports = route_types;