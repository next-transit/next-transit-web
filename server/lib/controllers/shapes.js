var promise = require('promise'),
	ctrl = require('./controller').create('shapes'),
	simplified_shapes = require('../models/simplified_shapes');

ctrl.action('index', { json:true }, function(req, res, callback) {
	if(req.route_id) {
		var route_id = req.route_id.toLowerCase(), route = req.route;

		simplified_shapes.api_query('/routes/' + route_id + '/shapes').then(function(results) {
			callback({ shapes:results });
		}, res.internal_error);
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

		simplified_shapes.api_query('/shapes', { bbox:bbox }).then(function(results) {
			callback({ routes:results });
		}, res.internal_error);
	} else {
		callback({ shapes:[] });
	}
});

module.exports = ctrl;