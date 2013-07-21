var route_types = require('../models/route_types'),
	routes = require('../models/routes'),
	directions = require('../models/directions'),
	simplified_stops = require('../models/simplified_stops'),
	app = {};

function getToStop(req, success, not_found) {
	if(req.params.to_id) {
		var route_id = req.route.route_id,
			direction_id = req.direction.direction_id,
			from_id = req.from_stop.stop_id,
			to_id = req.to_id = req.params.to_id;

		simplified_stops.where('route_id = ? AND stop_id = ? AND direction_id = ?', [route_id, to_id, direction_id]).first(function(stop) {
			if(stop) {
				app.locals.to_stop = req.to_stop = stop;
				app.locals.back_path += '/' + from_id + '/choose';
				success();
			} else {
				not_found();
			}
		});
	} else {
		success();
	}
}

function getFromStop(req, success, not_found) {
	if(req.params.from_id) {
		var route_id = req.route.route_id,
			direction_id = req.direction.direction_id,
			from_id = req.from_id = req.params.from_id;

		simplified_stops.where('route_id = ? AND stop_id =? AND direction_id = ?', [route_id, from_id, direction_id]).first(function(stop) {
			if(stop) {
				app.locals.from_stop = req.from_stop = stop;
				app.locals.back_path += '/' + req.direction_id;
				getToStop(req, success, not_found);
			} else {
				not_found();
			}
		});
	} else {
		success();
	}
}

function getDirection(req, success, not_found) {
	if(req.params.direction_id) {
		var direction_id = req.params.direction_id;
		directions.where('route_id = ? AND direction_id = ?', [req.route.route_id, direction_id]).first(function(direction) {
			if(direction) {
				app.locals.direction_id = req.direction_id = direction_id;
				app.locals.direction = req.direction = direction;
				app.locals.back_path += '/' + req.route_id;
				getFromStop(req, success, not_found);
			} else {
				not_found();
			}
		});
	} else {
		success();
	}
}

function getRoute(req, success, not_found) {
	if(req.params.route_id) {
		var route_id = req.params.route_id.toLowerCase();
		routes.where('route_id = ? OR lower(route_short_name) = ?', [route_id, route_id]).first(function(route) {
			if(route) {
				app.locals.route_id = req.route_id = route_id;
				app.locals.route = req.route = route;
				app.locals.back_path = '/' + req.route_type.slug;
				getDirection(req, success, not_found);
			} else {
				not_found();
			}
		});	
	} else {
		success();
	}
}

function getRouteType(req, success, not_found) {
	if(req.params.route_type) {
		var route_type_param = req.route_type = req.params.route_type.toLowerCase(),
			route_type = route_types[route_type_param];

		if(route_type) {
			req.route_type_id = route_type.id;
			app.locals.route_type_slug = req.route_type_slug = route_type.slug;
			app.locals.route_type = req.route_type = route_type;
			app.locals.back_path = '/';
			getRoute(req, success, not_found);
		} else {
			not_found();
		}
	} else {
		success();
	}
}

function before(req, res, next) {
	getRouteType(req, next, function() {
		res.send('404');
	});
}

module.exports = {
	app: function(ap) {
		app = ap;
	},
	before: before
};