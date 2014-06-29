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
				req.locals.has_realtime = req.route_type.has_realtime;
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

function get_route_types(req, success, not_found, error) {
	route_types.all().then(function(types) {
		req.route_types = types;
		build_menu(req);
		get_route_type(req, success, not_found, error);
	}, error);
}

function get_agency(req, success, not_found, error) {
	agencies.get(config.agency).then(function(agency) {
		if(agency) {
			req.locals.agency = req.agency = agency;
			get_route_types(req, success, not_found, error);
		} else {
			not_found('Could not find agency.');
		}
	}, error);
}

function build_menu(req) {
	var route_types = req.route_types || [],
		menu_items = [];

	route_types.forEach(function(type) {
		if(type.menu_label) {
			menu_items.push({ slug:type.slug, label:type.menu_label });
		}
	});

	// Sort A-Z by label ... for now
	menu_items.sort(function(a, b) {
		return a.label > b.label;
	});

	req.locals.footer_menu_items = menu_items;
}

function persist_state(req, res, next) {
	if(req.locals.is_html && req.locals.native_webapp) {
		var state = req.cookies.state || {},
			history = state.history || [],
			last_path = history[history.length - 1];

		if(last_path 
			&& req.locals.native_webapp 
			&& req.path === '/' 
			&& last_path !== '/'
			&& !req.get('referer')) {
				if(history.length > 1) {
					req.session.last_path = history[history.length - 2];
				}
				res.redirect(last_path);
				return;
		} else {
			var push_path = req.url.replace(/(\?|&)layout=false$/i, '').replace(/layout=false&/i, ''),
				cookie_settings = { maxAge:(1000 * 60 * 30) }; // 30 mins

			if(last_path !== push_path) {
				history.push(push_path);
				res.cookie('state', { history:history }, cookie_settings);
			}
		}
	}

	next();
}

function before(req, res, next) {
	if(config.verbose) {
		console.log('request path', req.url)	
	}

	res.error = function(message, status_code) {
		status_code = status_code || 500;
		res.send(status_code, {
			success: false,
			message: message || '',
			status_code: status_code || 500
		});
	};

	res.internal_error = function(err) {
		console.error('Internal error', err);
		res.error('Internal error');
	};

	req.locals = {
		app_version: package.version,
		agency: {},
		app_title: config.agency_settings.app_title,
		search_text: config.agency_settings.search_text,
		twitter_acct: config.agency_settings.twitter_acct,
		google_ua_code: config.agency_settings.google_ua_code,
		google_ua_url: config.agency_settings.google_ua_url,
		last_path: req.session.last_path,
		last_trip: req.session.last_trip,
		show_footer: req.originalUrl !== '/',
		native_webapp: /iphone/i.test(req.headers['user-agent'] || ''),
		is_html: /text\/html/i.test(req.headers.accept)
	};

	if(req.method === 'GET' && req.locals.is_html && req.params.layout !== 'false') {
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

	persist_state(req, res, function() {
		get_agency(req, next, function(msg) {
			res.send(404, msg || '404');
		}, function(err) {
			console.log('Internal server error:', err);
			res.send(500, 'Sorry, an error occurred.');
		});
	});
}

module.exports = {
	before: before
};
