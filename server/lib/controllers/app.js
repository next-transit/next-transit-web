var package = require(__dirname + '/../../../package.json'),
	config = require('../util/config'),
	agencies = require('../models/agencies'),
	route_types = require('../models/route_types'),
	routes = require('../models/routes'),
	directions = require('../models/directions'),
	simplified_stops = require('../models/simplified_stops');

function get_to_stop(req, success, not_found, error) {
	if(req.params.to_id) {
		var route_id = req.route.route_id,
			direction_id = req.direction.direction_id,
			from_id = req.from_stop.stop_id,
			to_id = req.to_id = req.params.to_id;

		simplified_stops.get(route_id, direction_id, to_id).then(function(stop) {
			if(stop) {
				req.locals.to_stop = req.to_stop = stop;
				req.locals.back_path += '/' + from_id + '/choose';
				success();
			} else {
				not_found('Could not find to stop.');
			}
		});
	} else {
		success();
	}
}

function get_from_stop(req, success, not_found, error) {
	if(req.params.from_id) {
		var route_id = req.route.route_id,
			direction_id = req.direction.direction_id,
			from_id = req.from_id = req.params.from_id;

		simplified_stops.get(route_id, direction_id, from_id).then(function(stop) {
			if(stop) {
				req.locals.from_stop = req.from_stop = stop;
				req.locals.back_path += '/' + req.direction_id;
				get_to_stop(req, success, not_found, error);
			} else {
				not_found('Could not find from stop.');
			}
		}, error);
	} else {
		success();
	}
}

function get_direction(req, success, not_found, error) {
	if(req.params.direction_id) {
		var direction_id = req.params.direction_id;

		directions.get(req.route_id, direction_id).then(function(direction) {
			if(direction) {
				req.locals.direction_id = req.direction_id = direction_id;
				req.locals.direction = req.direction = direction;
				req.locals.back_path += '/' + req.route_id;
				get_from_stop(req, success, not_found, error);
			} else {
				not_found('Could not find route direction.');
			}
		}, error);
	} else {
		success();
	}
}

function get_route(req, success, not_found, error) {
	if(req.params.route_id) {
		var route_id = req.params.route_id.toLowerCase();

		routes.get(route_id).then(function(route) {
			if(route) {
				req.locals.route_id = req.route_id = route_id;
				req.locals.route = req.route = route;
				req.locals.back_path = '/' + req.route_type.slug;
				get_direction(req, success, not_found, error);
			} else {
				not_found('Could not find route.');
			}
		}, error);
	} else {
		success();
	}
}

function get_route_type(req, success, not_found, error) {
	if(req.params.route_type) {
		var route_type_param = req.route_type = req.params.route_type.toLowerCase();

		route_types.get(route_type_param).then(function(route_type) {
			if(route_type) {
				req.route_type_id = route_type.route_type_id;
				req.locals.route_type_slug = req.route_type_slug = route_type.slug;
				req.locals.route_type = req.route_type = route_type;
				req.locals.back_path = '/';
				get_route(req, success, not_found, error);
			} else {
				not_found('Could not find route type.');
			}
		}, error);
	} else {
		success();
	}
}

function get_agency(req, success, not_found, error) {
	agencies.get(config.agency).then(function(agency) {
		if(agency) {
			req.agency = agency;
			get_route_type(req, success, not_found, error);
		} else {
			not_found('Could not find agency.');
		}
	}, error);
}

function before(req, res, next) {
	if(config.verbose) {
		console.log('request path', req.path)	
	}

	req.locals = {
		app_version: package.version,
		agency: {},
		last_path: req.session.last_path,
		last_trip: req.session.last_trip,
		show_footer: req.originalUrl !== '/'
	};

	if(req.method === 'GET' && /text\/html/i.test(req.headers.accept) && req.params.layout !== 'false') {
		req.locals.back_path = '';
		if(req.session.last_path !== req.originalUrl) {
			if(req.originalUrl !== '/') {
				req.locals.back_path = req.session.last_path;
			}
			req.session.last_path = req.originalUrl;
		}
	}

	if(req.query.layout === 'null' || req.query.layout === 'false') {
		req.locals.layout = null;
	} else if(config.debug_assets) {
		req.locals.layout = 'layout_debug';
	}

	get_agency(req, next, function(msg) {
		res.send(404, msg || '404');
	}, function(err) {
		console.log('Internal server error:', err);
		res.send(500, 'Sorry, an error occurred.');
	});
}

module.exports = {
	before: before
};