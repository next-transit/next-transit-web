(function(global) {
	var nextsepta = global.nextsepta,
		_modules = {};

	function Module(name, dependencies) {
		var _self = this,
			_config = nextsepta.noop,
			_controllers = {},
			_services = {},
			$module;

		_self.CLASS = 'Module';
		_self.name = name;
		_self.dependencies = dependencies;
		_self.loaded = false;
		
		_self.config = function(callback) {
			if(typeof callback === 'function') {
				_config = callback;
			}
			return _self;
		};

		_self.dependency = function(depName) {
			var dep;
			if(depName in _services) {
				dep = _services[depName];
			} else {
				_self.dependencies.some(function(modDep) {
					dep = _modules[modDep].dependency(depName);
					return !!dep;
				});
			}
			return dep;
		};

		_self.run = function() {
			if(!_self.loaded) {
				_self.config();
				_self.dependencies.forEach(function(depName) {
					if(!(depName in _modules)) {
						throw new Error('Module ' + depName + ' doesn\'t exist.');
					}
					_modules[depName].run();
				});
				_self.loaded = true;
				$(function() {
					_self.$elem = $('[module=' + _self.name + ']');
					_self.parse('body');
					_self.dependency('content_settings').parse($('.js-content').html());
				});
			}
		};

		_self.service = function(name, dependencies) {
			if(name in _services) {
				throw new Error('A dependency named ' + name + ' already exists.');
			}

			var service_def = nextsepta.__service(name, dependencies),
				args = [];

			service_def.dependencies.forEach(function(depName) {
				if(depName === 'module') {
					args.push(_self);
				} else {
					args.push(_self.dependency(depName));
				}
			});

			_services[name] = service_def.constructor.apply(service_def, args);

			return _self;
		};

		_self.controller = function(name, dependencies) {
			if(dependencies) {
				nextsepta.__controller(name, dependencies, _controllers);
				return _self;	
			} else {
				return _controllers[name];
			}
		};

		_self.on = function(name, handler) {
			$(_self).bind(name, handler);
		};

		_self.emit = function(name, data) {
			$(_self).trigger(name, data);
		};

		_self.parse = function(selector) {
			nextsepta.__parse(_self, selector);
		};

		var _data_store = {};
		_self.data = function(name, value) {
			if(typeof value === 'undefined') {
				return _data_store[name];
			} else {
				_data_store[name] = value;
			}
		};
	}

	nextsepta.module = function module(name, dependencies) {
		dependencies = dependencies || [];

		if(!(name in _modules)) {
			_modules[name] = new Module(name, dependencies);
		}

		return _modules[name];
	};
})(window);
