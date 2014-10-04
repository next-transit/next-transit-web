var extend = require('extend');

function Controller(name) {
	var _actions = {}, _self = this;

	_self.name = name;

	_self.action = function(name, options, callback) {
		if(typeof options === 'function') {
			callback = options;
			options = {};
		}
		
		_actions[name] = function(req, res) {
			callback(req, res, function(view, data) {
				if(typeof view === 'object') {
					data = view;
					view = null;
				}

				if(options.json) {
					res.send(data);
				} else {
					var app_title = req.locals.app_title || 'NEXT|Transit',
						view_data = extend({}, req.locals, data || {});

					if(view_data.title) {
						view_data.page_title = view_data.title;
						view_data.title += ' - ' + app_title;
					} else {
						view_data.title = view_data.page_title = view_data.app_title;
					}

					res.render(view || _self.name, view_data, function(err, html) {
						res.send(html);
					});
				}
			});
		};

		return _self;
	};

	_self.get_action = function(name) {
		return _actions[name] || _actions.index;
	};

	_self.action('index', function(req, res, callback) {
		callback();
	});
}

module.exports = {
	create: function(name) {
		return new Controller(name);
	}
};