var package = require(__dirname + '/../../../package.json'),
	config = require('../util/config'),
	agencies = require('../models/agencies'),
	route_types = require('../models/route_types'),
	routes = require('../models/routes'),
	directions = require('../models/directions'),
	simplified_stops = require('../models/simplified_stops');

function getToStop(req, success, not_found) {
	if(req.params.to_id) {
		var route_id = req.route.route_id,
			direction_id = req.direction.direction_id,
			from_id = req.from_stop.stop_id,
			to_id = req.to_id = req.params.to_id;

		simplified_stops.where('route_id = ? AND stop_id = ? AND direction_id = ?', [route_id, to_id, direction_id]).first(function(stop) {
			if(stop) {
				req.locals.to_stop = req.to_stop = stop;
				req.locals.back_path += '/' + from_id + '/choose';
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
				req.locals.from_stop = req.from_stop = stop;
				req.locals.back_path += '/' + req.direction_id;
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
				req.locals.direction_id = req.direction_id = direction_id;
				req.locals.direction = req.direction = direction;
				req.locals.back_path += '/' + req.route_id;
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
		routes.query(req.agency.id)
			.where('agency_id = ? AND (lower(route_id) = ? OR lower(route_short_name) = ?)', [req.agency.id, route_id, route_id])
			.first(function(route) {
				if(route) {
					req.locals.route_id = req.route_id = route_id;
					req.locals.route = req.route = route;
					req.locals.back_path = '/' + req.route_type.slug;
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
		var route_type_param = req.route_type = req.params.route_type.toLowerCase();

		route_types.get_by_slug(req.agency.id, route_type_param, function(route_type) {
			if(route_type) {
				req.route_type_id = route_type.route_type_id;
				req.locals.route_type_slug = req.route_type_slug = route_type.slug;
				req.locals.route_type = req.route_type = route_type;
				req.locals.back_path = '/';
				getRoute(req, success, not_found);
			} else {
				not_found();
			}
		});
	} else {
		success();
	}
}

function getAgency(req, success, not_found) {
	agencies.where('slug = ?', [config.agency]).first(function(agency) {
		if(agency) {
			req.agency = agency;
			getRouteType(req, success, not_found);
		} else {
			console.error('Could not find agency', config.agency);
			not_found();
		}
	}, not_found);
}

function before(req, res, next) {
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

	getAgency(req, next, function() {
		res.send('404');
	});
}

module.exports = {
	before: before
};