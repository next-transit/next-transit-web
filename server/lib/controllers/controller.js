function Controller(name) {
	var _actions = {}, _self = this;

	_self.name = name;

	_self.action = function(name, callback) {
		_actions[name] = function(req, res) {
			callback(req, res, function(view, data) {
				if(typeof view === 'object') {
					data = view;
					view = null;
				}
				data = data || {};
				res.render(view || _self.name, data, function(err, html) {
					res.send(html);
				});
			});
		};

		return _self;
	};

	_self.getAction = function(name) {
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