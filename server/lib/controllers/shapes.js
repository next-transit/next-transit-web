var promise = require('promise'),
	ctrl = require('./controller').create('shapes'),
	routes = require('../models/routes'),
	shapes = require('../models/shapes');

function get_simplified_shape_by_route_id(route_id) {
	return new promise(function(resolve, reject) {
		shapes.where('lower(route_id) = ?', [route_id.toLowerCase()])
			.orders('shape_pt_sequence')
			.done(function(points) {
				var simplified_shape = [];
				points.forEach(function(point) {
					simplified_shape.push([parseFloat(point.shape_pt_lat), parseFloat(point.shape_pt_lon)]);
				});
				
				routes.where('lower(route_id) = ? OR lower(route_short_name) = ?', [route_id.toLowerCase(), route_id.toLowerCase()]).first(function(route) {
					routes.process(route, function(processed) {
						processed.points = simplified_shape;
						resolve(processed);
					});
				});
			});
	});
}

function get_shapes_for_routes(route_results, callback) {
	if(!route_results || !route_results.length) {
		callback([]);
		return;
	}

	var routes = [], 
		promises = [];

	route_results.forEach(function(result) {
		if(result.route_id) {
			promises.push(get_simplified_shape_by_route_id(result.route_id));
		}
	});

	promise.all(promises).done(function(routes) {
		callback(routes);
	});
}

ctrl.action('index', { json:true }, function(req, res, callback) {
	if(req.route_id) {
		var route_id = req.route_id.toLowerCase(), route = req.route;

		get_simplified_shape_by_route_id(route_id, function(simplified_shape) {
			callback(simplified_shape);
		});
	} else {
		callback({ shapes:[] });
	}
});

ctrl.action('bbox', { json:true }, function(req, res, callback) {
	if(req.query.bbox) {
		var bbox = req.query.bbox.split(','),
			left = parseFloat(bbox[0]),
			bottom = parseFloat(bbox[1]),
			right = parseFloat(bbox[2]),
			top = parseFloat(bbox[3]);

		shapes.query()
			.select('distinct route_id')
			.where('shape_pt_lon > ? AND shape_pt_lon < ? AND shape_pt_lat > ? AND shape_pt_lat < ?', [left, right, bottom, top])
			.done(function(results) {
				get_shapes_for_routes(results, function(routes) {
					callback({ routes:routes });
				});
			});
	} else {
		callback({ shapes:[] });
	}
});

module.exports = ctrl;