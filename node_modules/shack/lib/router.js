var colors = require('colors'),
	extend = require('extend'),
	utils = require('./utils'),
	config = require('./config');

function noop() {}

function gen_uses(uses, ctrl) {
	return uses.map(function(fn) {
		return function(req, res, next) {
			fn(req, res, next, ctrl.settings);
		};
	});
}

function register_route(app, method, path, ctrl, action, befores, afters) {
	var args = [path]
					.concat(gen_uses(befores, ctrl))
					.concat([action])
					.concat(gen_uses(afters, ctrl))
					.concat([noop]);

	app[method].apply(app, args);
}

function get_controller(name, settings) {
	var paths = [
		process.cwd() + '/' + settings.controllers + '/' + name,
		settings.controllers + '/' + name
	];
	return utils.require_file(paths);
}

function read_routes(app, callback) {
	var routes = config.read_routes(app.settings.routes);
	
	for(var key in routes) {
		var method = 'get',
			path = key,
			route_options = routes[key],
			ctrl_name = (typeof route_options === 'object') ? route_options.action : route_options,
			ctrl_parts = ctrl_name.split(':'),
			ctrl = get_controller(ctrl_parts[0], app.settings);

		if(ctrl) {
			var action = ctrl.get_action(ctrl_parts[1] || 'index'),
				method_matches = key.match(/^(get|post|put|delete) /i);

			if(method_matches) {
				path = key.replace(method_matches[0], '');
				method = method_matches[1];
			}

			callback(method, path, ctrl, action);
		} else {
			console.error('Could not find controller in routes', ctrl_name);
		}
	}
}

function Router() {
	var self = this;

	self.befores = [];
	self.afters = [];
	self.routes = null;

	self.middleware = function(app) {
		return function(req, res, next) {
			if(!self.routes) {
				self.routes = [];
				read_routes(app, function(method, path, ctrl, action) {
					register_route(app, method, path, ctrl, action, self.befores, self.afters);
					self.routes.push({ path:path, controller:ctrl });
				});
			}
			next();
		};
	};
}

module.exports = function() {
	return new Router();
};
