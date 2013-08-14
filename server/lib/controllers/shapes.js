var ctrl = require('./controller').create('shapes'),
	shapes = require('../models/shapes');

ctrl.action('index', { json:true }, function(req, res, callback) {
	var route_id = req.route_id.toLowerCase(), route = req.route;

	shapes.where('lower(route_id) = ?', [route_id])
		.orders('shape_pt_sequence')
		.done(function(shapes) {
			var simplified_shapes = [];
			shapes.forEach(function(shape) {
				simplified_shapes.push([parseFloat(shape.shape_pt_lat), parseFloat(shape.shape_pt_lon)]);
			});
			callback({ shapes:simplified_shapes });
		});
});

module.exports = ctrl;