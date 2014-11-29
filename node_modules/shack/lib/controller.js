var extend = require('extend');

function default_callback(req, res, success) {
	success();
}

function Controller(name, settings) {
	var _actions = {}, 
		_self = this;

	_self.name = name;
	_self.settings = extend({}, settings);
	_self.require_login = !!_self.settings.require_login;

	_self.action = function(action_name, settings, callback) {
		if(typeof settings === 'function') {
			callback = settings;
			settings = {};
		} else if(!callback) {
			callback = default_callback;
			settings = {};
		}
		
		_actions[action_name] = function(req, res, next) {
			callback(req, res, function(view, data) {
				if(typeof view === 'object') {
					data = view;
					view = null;
				}
				view = view || _self.name.replace(/\-/g, '_') + '/' + action_name;
				data = data || {};

				if(settings.json) {
					data.success = true;
					data.status_code = 200;

					res.type('application/json');

					res.send(data);
				} else {
					if(typeof settings.layout !== 'undefined') {
						req.locals.layout = settings.layout;
					}

					var messages;
					if(typeof req.flash === 'function') {
						messages = req.flash();
					}

					var view_data = extend({ page_name:_self.name, messages:messages }, req.locals, data || {});

					if(typeof _self.settings.prerender === 'function') {
						_self.settings.prerender(req, view_data);
					}

					res.render(view, view_data, function(err, html) {
						res.send(html);
					});
				}

				next();
			});
		};

		return _self;
	};

	_self.get_action = function(name) {
		return _actions[name] || _actions.index;
	};

	// Create a default pass-through index action
	_self.action('index');
}

Controller.prototype.toString = function() {
	return 'Controller: ' + this.name || 'unknown';
};

module.exports = function(name, settings) {
	return new Controller(name, settings);
};
