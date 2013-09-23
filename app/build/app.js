(function(global) {
	Function.prototype.curry = Function.prototype.curry || function () {
		var fn = this, args = Array.prototype.slice.call(arguments);
		return function () {
			return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
		};
	};
	
	var nextsepta = global.nextsepta = {};

	nextsepta.noop = function noop() {};
})(window);
(function(global) {
	var nextsepta = global.nextsepta;

	nextsepta.__controller = function controller(name, config, collection) {
		if(config) {
			if(name in collection) {
				throw new Error('Controller ' + name + ' already exists.');
			}

			var dependencies = [],
				constructor;

			if(config.forEach) {
				config.forEach(function(param) {
					if(typeof param === 'string') {
						dependencies.push(param);
					} else if(typeof param === 'function') {
						constructor = param;
						return false;
					}
				});
			} else if(typeof config === 'function') {
				constructor = config;
			}

			collection[name] = { name:name, dependencies:dependencies, constructor:constructor };

			return nextsepta;
		}

		return collection[name];
	};
})(window);
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
(function(global) {
	var nextsepta = global.nextsepta;

	nextsepta.__parse = function parse(module, selector) {
		var $elem = $(selector, module.$elem),
			$parent = $elem.parent();

		$('[ctrl]', $parent).each(function() {
			var $ctrl = $(this);
			if(!$ctrl.data('nextsepta-ctrl')) {
				var ctrlName = $ctrl.attr('ctrl'),
					ctrl = module.controller(ctrlName);

				if(ctrl) {
					$ctrl.data('nextsepta-ctrl', ctrl);

					var args = [];
					ctrl.dependencies.forEach(function(depName) {
						if(depName === '$elem') {
							args.push($ctrl);
						} else if(depName === 'module') { 
							args.push(module);
						} else {
							args.push(module.dependency(depName));
						}
					});

					ctrl.constructor.apply(ctrl, args);
				}	
			}
		});
	};
})(window);
(function(global) {
	var nextsepta = global.nextsepta;

	nextsepta.__service = function service(name, config) {
		var dependencies = [],
			constructor;

		if(config.forEach) {
			config.forEach(function(param) {
				if(typeof param === 'string') {
					dependencies.push(param);
				} else if(typeof param === 'function') {
					constructor = param;
					return false;
				}
			});
		} else if(typeof config === 'function') {
			constructor = config;
		}

		return { name:name, dependencies:dependencies, constructor:constructor };
	};
})(window);

nextsepta.module('nextsepta').service('resize', [function() {
	var SIZES = {
			mobile: { min:0, max:520 },
			tablet: { min:521, max:960 },
			desktop: { min:961, max:99999 }
		},
		_height = $(window).height(),
		_width = $(window).width(),
		_is = {
			mobile: true,
			tablet: false,
			desktop: false
		};

	function reset_is() {
		_is = {
			mobile: (_width <= SIZES.mobile.max),
			tablet: (_width >= SIZES.tablet.min && _width <= SIZES.tablet.max),
			desktop: (_width >= SIZES.desktop.min)
		};
	}

	function is_size(size) {
		if(size in SIZES) {
			return _is[size];
		}
	}

	$(window).resize(function(evt) {
		_height = $(window).height();
		_width = $(window).width();
		reset_is();
	});
	
	reset_is();

	return {
		height: function() {
			return _height;
		},
		width: function() {
			return _width;
		},
		is: is_size,
		is_mobile: is_size.curry('mobile'),
		is_tablet: is_size.curry('tablet'),
		is_desktop: is_size.curry('desktop')
	};
}]);
nextsepta.module('nextsepta').service('content_settings', ['module', function(module) {
	function parse_settings(content, callback) {
		var settings = {
				title: '',
				back: true,
				options: true,
				footer: true,
				map: false,
				map_locate: false,
				map_vehicle: null,
				route_type: null,
				route_id: null
			},
			comment_matches = content.match(/<!-- (.+) -->/i),
			matches = content.match(/<!-- (title: ([\w\|\- ]+));? ?(back: ?([\w]+))?;? ?(options: ?([\w]+))?;? ?(footer: ?([\w]+))?;? -->/i);

		if(comment_matches) {
			var settings_matches = comment_matches[1].match(/((\w)+: ?([^;]+))/ig);
			
			if(settings_matches) {
				settings_matches.forEach(function(setting_match) {
					var setting_parts = setting_match.split(/: ?/);
					if(setting_parts.length === 2) {
						var setting_name = setting_parts[0],
							setting_value = setting_parts[1];

						if(setting_value === 'true' || setting_value === 'false') {
							setting_value = setting_value === 'true';
						}

						if(setting_name in settings) {
							settings[setting_name] = setting_value;
						}
					}
				});
			}
		}

		if(typeof callback === 'function') {
			callback(settings);
		}

		module.emit('content-settings-changed', [settings]);
	}

	return { parse:parse_settings };
}]);
nextsepta.module('nextsepta').service('cookie', [function() {
	function _set(name, value, options) {
		options = options || {};
		if(value === null) { value = ''; }
		var expires = '';
		if(options.expires) {
			var date;
			if(options.expires.getDate) {
				date = options.expires;
			} else if(typeof options.expires === 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 86400000)); // 8640000 = days (1000 * 60 * 60 * 24)
			}
			if(date) {
				expires = '; expires=' + date.toUTCString();
			}
		}

		var path = options.path ? '; path=' + (options.path) : '',
			domain = options.domain ? '; domain=' + (options.domain) : '',
			secure = options.secure ? '; secure' : '';
		// Write cookie value
		document.cookie = name + '=' + encodeURIComponent(value) + expires + path + domain + secure;
	}

	function _get(name) {
		var val;
		if(document.cookie) {
			var cookies = document.cookie.split(';');
			for(var i = 0, len = cookies.length; i < len; i++) {
				var cookie = $.trim(cookies[i]);
				if(cookie.startsWith(name+'=')) {
					val = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return val;
	}

	return function cookie(name, value, options) {
		if(typeof valid === 'undefined') {
			_set(name, value, options);
		} else {
			return _get(name);
		}
	};
}]);
nextsepta.module('nextsepta').service('data', [function() {
	function request(options) {
		var req_settings = $.extend({ dataType:'json' }, options);

		$.ajax(req_settings);
	}

	return {
		get: function(url, success, error) {
			request({ url:url, method:'GET', success:success, error:error });
		},
		get_html: function(url, success, error) {
			request({ url:url, method:'GET', dataType:'html', success:success, error:error });
		},
		post: function(url, data, success, error) {
			request({ url:url, method:'POST', data:data, success:success, error:error });
		}
	};
}]);
nextsepta.module('nextsepta').service('geo_utils', [function() {
	function number_to_radius(n) {
		return n * Math.PI / 180;
	}

	function point_distance(pt1, pt2) {
		var lat1 = pt1[0],
			lat2 = pt2[0],
			lng1 = pt1[1],
			lng2 = pt2[1],
			r_lat = number_to_radius(lat2 - lat1),
			r_lng = number_to_radius(lng2 - lng1),
			a = Math.pow(Math.sin(r_lat / 2), 2) + 
				Math.cos(number_to_radius(lat1)) * 
				Math.cos(number_to_radius(lat2)) * 
				Math.pow(Math.sin(r_lng / 2), 2),
			b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return (6371 * b) * 1000;
	}

	return {
		point_distance: point_distance
	};
}]);
nextsepta.module('nextsepta').service('history', ['module', 'data', 'resize', 'content_settings', function(module, data, resize, settings) {
	if(!window.history) {
		return {};
	}

	var $back_btn,
		$options_btn,
		$content,
		$map,
		$footer;

	function apply_content_settings(settings) {
		$('.js-app-title').text(settings.title || 'NEXT|Septa');
		$('.js-title').text(settings.title ? (settings.title + ' - NEXT|Septa') : 'NEXT|Septa');
		$back_btn[settings.back ? 'addClass' : 'removeClass']('active');
		$options_btn[settings.options ? 'addClass' : 'removeClass']('active');
		$footer[settings.footer ? 'addClass' : 'removeClass']('active').removeClass('subways buses trolleys trains').addClass(settings.route_type || '');
		$map[settings.map ? 'addClass' : 'removeClass']('active');
		$content[settings.map ? 'hide' : 'show']();
	}

	function animate_content(content, slide_right) {
		var going = 'going-left',
			incoming_side = 'right',
			incoming_direction = 'left',
			animate_current = {},
			animate_incoming = {},
			animate_complete = {};

		if(slide_right) {
			going = 'going-right';
			incoming_side = 'left';
			incoming_direction = 'right';
		}

		animate_current[incoming_side] = '100%';
		animate_incoming[incoming_direction] = 0;
		animate_complete[incoming_direction] = 'auto';

		var $current = $('.js-content-panel', $content).addClass(['current', going].join(' ')),
			$next = $('<div class="content-panel js-content-panel"></div>').addClass(['incoming', incoming_side].join(' ')).append(content).appendTo($content);

		$current.animate(animate_current, function() {
			$current.remove();
		});
		$next.animate(animate_incoming, function() {
			$next.removeClass('incoming right left').css(incoming_direction, 'auto');
		});
	}

	function render_content(content, path, push) {
		settings.parse(content, function(settings) {
			if(push) {
				history.pushState(settings, '', path);
			}
			apply_content_settings(settings);

			if($content.is(':visible')) {
				if(resize.is_desktop()) {
					$content.hide().html('<div class="content-panel js-content-panel">' + content + '</div>').fadeIn('fast');
				} else {
					animate_content(content, !push);
				}
				parse();
			}
		});
	}

	function get_content(url, success) {
		var url_parts = url.split('?'),
			query = '?' + (url_parts[1] ? url_parts[1] + '&' : '') + 'layout=false';

		data.get_html(url_parts[0] + query, function(content) {
			success(content, url);
		});
	}

	function push_path(path) {
		$back_btn.attr('href', window.location.pathname);
		get_content(path, function(content, path) {
			render_content(content, path, true);
		});
	}

	// Looks for ".js-nav-link" elements and binds an override to History
	function attach_events($context) {
		$context = $context || $('body');
		$('.js-nav-link', $context).each(function() {
			if(!$(this).data('nav-link-bound')) {
				$(this).click(function() {
					var path = $(this).attr('href');
					if(path) {
						push_path($(this).attr('href'));
					}
					return false;
				}).data('nav-link-bound', true);
			}
		});
	}

	// Evaluates html for "directives" and attaches history event handlers
	function parse($context) {
		$context = $context || $content;
		nextsepta.module('nextsepta').parse($context);
		attach_events($context);
	} 

	// Initial event binding for links and window.History
	$(function() {
		// Bind custom events for the "back" and "options" buttons
		$back_btn = $('.js-nav-link-back').click(function() {
			window.history.back();
			return false;
		});
		$options_btn = $('.js-header-options-btn');
		$footer = $('.js-app-footer');
		$map = $('.js-map');

		// Get persistent "content" wrapper element
		$content = $('.js-content');

		// Do initial event bindings for whatever we have to start with
		attach_events();

		// Event listener for browser back button clicks
		var first_pop = true;
		$(window).bind('popstate', function(evt) {
			if(first_pop) { first_pop = false; return; }
			get_content(window.location.pathname, render_content);
		});
	});

	return {
		parse: function($elem) {
			attach_events($elem);
		},
		push: push_path,
		back: function() {
			window.history.back();
		}
	};
}]);
nextsepta.module('nextsepta').service('map_locate', ['module', 'data', 'history', 'geo_utils', function(module, data, history, geo_utils) {
	var map_ctrl,
		active = false,
		initialized = false,
		$map,
		$results,
			$results_list;

	function render_user_location(lat, lng) {
		map_ctrl.add_marker(lat, lng);
	}

	function sort_top_results(results, limit) {
		var center = map_ctrl.map.getCenter(),
			center_point = [center.lat, center.lng],
			route_closest_points = [];

		results.forEach(function(result) {
			var closest_distance = 9999;

			result.points.forEach(function(point) {
				var distance = geo_utils.point_distance(center_point, point);

				if(distance < closest_distance) {
					closest_distance = distance;
				}
			});

			route_closest_points.push({ result:result, closest_distance:closest_distance });
		});

		route_closest_points.sort(function(a, b) {
			return a.closest_distance - b.closest_distance;
		});

		var limited = [], count = 0;
		route_closest_points.forEach(function(route) {
			if(count++ < limit) {
				limited.push(route.result);
			}
		});

		return limited;
	}

	function render_routes(results) {
		$results_list.empty();
		map_ctrl.clear_vectors();

		results.forEach(function(result) {
			if(result.shapes.length) {

				var route_layer = map_ctrl.add_vector(result.shapes, result.color, 0.45);

				route_layer.on('click', function(evt) {
					history.push('/' + result.route_type_slug + '/' + result.slug);
				}).on('mouseover', function() {
					route_layer.setStyle({ opacity:0.9 });
				}).on('mouseout', function() {
					route_layer.setStyle({ opacity:0.45 });
				});
				result.route_layer = route_layer;
			}
		});

		var sorted_list = sort_top_results(results, 8);
		sorted_list.forEach(function(result) {
			var $li = $('<li />').appendTo($results_list);
			$('<a href="/' + result.route_type_slug + '/' + result.slug + '" class="js-nav-link">' + result.route_name + '</a>')
				.css('backgroundColor', result.color)
				.appendTo($li)
				.hover(function() {
					result.route_layer.setStyle({ opacity:0.9 });
				}, function() {
					result.route_layer.setStyle({ opacity:0.45 });
				});
		});

		$results.show();

		history.parse($results);
	}

	function get_nearby_routes() {
		var bounds = map_ctrl.map.getBounds(),
			bbox = [bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat].join(',');

		data.get('/shapes?bbox=' + bbox, function(resp) {
			if(resp && resp.routes) {
				render_routes(resp.routes);
			}
		});
	}

	function locate() {
		active = true;
		// render_user_location(39.926312796934674, -75.16697645187378);
		// return;

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				if(position) {
					render_user_location(position.coords.latitude, position.coords.longitude);
				}
			});
		}
	}

	function initialize() {
		if(!initialized) {
			module.on('map-moveend', function() {
				if(active) {
					get_nearby_routes();
				}
			});

			$results = $('<div class="map-results-list"></div>').hide().appendTo($map);
			$results_list = $('<ul></ul>').appendTo($results);

			initialized = true;
		}
	}

	return {
		locate: locate,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;
			$map = $map_elem;

			initialize();
		},
		disable: function() {
			if($results) {
				$results.hide();	
			}
			active = false;
		}
	};
}]);
nextsepta.module('nextsepta').service('map_markers', [function() {
	var initialized = false,
		layer_group,
		icons = {},
		markers = {};

	function get_marker_icon(icon_name) {
		icon_name = icon_name || 'marker-36';
		
		if(!(icon_name in icons)) {
			icons[icon_name] = L.icon({
				iconUrl: '/images/maki/' + icon_name + '.png',
				iconRetinaUrl: '/images/maki/' + icon_name + '@2x.png',
				iconSize: [32, 32],
				iconAnchor: [16, 16]
			});
		}

		return icons[icon_name];
	}

	function add_marker(lat, lng, options) {
		options = $.extend({
			id: '',
			icon: '',
			title: 'Location',
			zoom: 17,
			center: true,
			message: ''
		}, options);

		var marker = L.marker([lat, lng], {
			icon: get_marker_icon(options.icon)
		}).addTo(layer_group);

		if(options.message) {
			marker.popup = L.popup({
				autoPan: false,
				closeButton: false,
				offset: [52, 10]
			});
			marker.popup.setLatLng([lat, lng]);
			marker.popup.setContent('<div class="map-marker-info">' + options.message + '</div>');
			marker.popup.addTo(layer_group);
		}

		if(options.id) {
			markers[options.id] = marker;
		}

		if(options.center) {
			map_ctrl.set_center(lat, lng, options.zoom);	
		}

		return marker;
	}

	function move_marker(id, lat, lng, center) {
		if(id in markers) {
			markers[id].setLatLng([lat, lng]).update();
			if(markers[id].popup) {
				markers[id].popup.setLatLng([lat, lng]);
			}
			if(center) {
				map_ctrl.set_center(lat, lng, map_ctrl.map.getZoom());
			}
		}
	}

	function remove_marker(id) {
		if(id in markers) {
			layer_group.removeLayer(markers[id]);
		}
	}

	function clear_markers() {
		layer_group.clearLayers();
		markers = {};
	}

	function initialize() {
		if(!initialized) {
			layer_group = L.layerGroup().addTo(map_ctrl.map);

			initialized = true;
		}
	}

	return {
		add: add_marker,
		move: move_marker,
		remove: remove_marker,
		clear: clear_markers,
		set_map_ctrl: function(ctrl) {
			map_ctrl = ctrl;

			initialize();
		}
	};
}]);
nextsepta.module('nextsepta').service('map_vectors', ['data', function(data) {
	var initialized = false,
		map_ctrl,
		layer_group;

	function fit_to_last() {
		var layers = layer_group.getLayers();
		if(layers.length) {
			map_ctrl.map.fitBounds(layers[layers.length-1].getBounds());
		}
	}

	function add_shapes(shapes, color, opacity) {
		shapes.forEach(function(shape) {
			L.polyline(shape, {
				color: color || '#a33', 
				opacity: opacity || 0.65
			}).addTo(layer_group);
		});
	}

	function add_route(route_type, route_id, fit_to_route) {
		data.get(['', route_type, route_id, 'shape'].join('/'), function(resp) {
			add_shapes(resp.shapes, resp.color);
			if(fit_to_route) {
				fit_to_last();
			}
		});
	}

	function clear_layers() {
		layer_group.clearLayers();
	}

	function initialize() {
		if(!initialized) {
			layer_group = L.layerGroup().addTo(map_ctrl.map);

			initialized = true;
		}
	}

	return {
		add: add_shapes,
		add_route: add_route,
		clear: clear_layers,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;

			initialize();
		}
	};
}]);
nextsepta.module('nextsepta').service('map_vehicles', ['data', 'history', function(data, history) {
	var active = false,
		initialized = false,
		vehicles = {},
		track_interval,
		map_ctrl,
		icons = {
			bus: 'bus-36',
			rail: 'rail-36'
		},
		direction_icons = {
			NorthBound: 'icon-caret-up',
			EastBound: 'icon-caret-right',
			SouthBound: 'icon-caret-down',
			WestBound: 'icon-caret-left'
		},
		$map;

	function add_vehicle_markers(route_type, route_id, vehicle_id, vehicles_to_track) {
		var center_on_vehicle = vehicles_to_track.length === 1;

		map_ctrl.clear_markers();

		vehicles_to_track.forEach(function(vehicle) {
			var direction_icon = vehicle.direction ? ' <span class="' + direction_icons[vehicle.direction] + '"></span>' : '',
				title = (vehicle.mode === 'rail' ? 
							(vehicle.late + ' ' + (vehicle.late === 1 ? 'min' : 'mins') + ' late') : 
							(vehicle.offset + ' ' + (vehicle.offset === '1' ? 'min' : 'mins') + ' ago')) + direction_icon;

			map_ctrl.add_marker(vehicle.lat, vehicle.lng, {
				id: 'vehicle-' + vehicle.vehicle_id, 
				icon: icons[vehicle.mode], 
				title: title, 
				center: center_on_vehicle,
				zoom: 16,
				message: title
			}).on('click', function() {
				if(!vehicle_id) {
					history.push('/' + route_type + '/' + route_id + '/map?vehicle=' + vehicle.vehicle_id);	
				}
			});
			vehicles[vehicle.vehicle_id] = vehicle;
		});

		function exists(id) {
			var found = false;
			vehicles_to_track.forEach(function(vehicle) {
				if(vehicle.vehicle_id === id) {
					found = true;
				}
			});
			return found;
		}

		// Clear markers that have dropped out
		for(var id in vehicles) {
			if(!exists(id)) {
				map_ctrl.remove_marker('vehicle-' + id);
				delete vehicles[id];
			}
		}
	}

	function get_vehicles(route_type, route_id, vehicle_id) {
		data.get('/' + route_type + '/' + route_id + '/locations', function(resp) {
			if(resp && resp.vehicles) {

				var vehicles_to_track = [];
				resp.vehicles.forEach(function(resp_vehicle) {
					if(!vehicle_id || resp_vehicle.vehicle_id === vehicle_id) {
						vehicles_to_track.push(resp_vehicle);
					}
				});

				add_vehicle_markers(route_type, route_id, vehicle_id, vehicles_to_track);
			}
		});
	}

	function add_vehicles(route_type, route_id, vehicle_id) {
		if(route_type, route_id) {
			active = true;

			start_tracking(route_type, route_id, vehicle_id);
		}
	}

	function start_tracking(route_type, route_id, vehicle_id) {
		vehicles = {};
		track_interval = setInterval(function() {
			get_vehicles(route_type, route_id, vehicle_id);
		}, 1000 * 30); // 30 secs
		get_vehicles(route_type, route_id, vehicle_id);
	}

	function stop_tracking() {
		if(track_interval) {
			clearInterval(track_interval);
			track_interval = null;
		}
	}

	function initialize() {
		if(!initialized) {
			initialized = true;
		}
	}

	return {
		add_vehicle: add_vehicles,
		add_vehicles: add_vehicles,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;
			$map = $map_elem;

			initialize();
		},
		disable: function() {
			active = false;
			stop_tracking();
		}
	};
}]);
nextsepta.module('nextsepta').service('templates', [function() {
	function getTemplate(url, success) {
		$.ajax({
			url: url,
			method: 'GET',
			dataType: 'html',
			success: success
		});
	}

	return {
		'get': getTemplate
	};
}]);
nextsepta.module('nextsepta', ['templates', 'history', 'content_settings']).controller('app', ['module', '$elem', function(module, $elem) {
	var $content = $('.js-content', $elem);

	module.data('route-type', $content.attr('data-route-type'));
	module.data('route-id', $content.attr('data-route-id'));
}]).run();
nextsepta.module('nextsepta').controller('feedback', ['data', '$elem', function(data, $elem) {
	$('#feedback-submit-btn', $elem).click(function() {
		$('.error', $elem).removeClass('error');

		var name = $('#feedback-name').val(),
			email = $('#feedback-email').val(),
			message = $('#feedback-message').val();

		if(message) {
			$('<div class="message success"><p>Thanks for your feedback!</p></div>').prependTo($elem);
			data.post('/feedback', { name:name, email:email, message:message });
		} else {
			$('#feedback-message').parents('.control-group').addClass('error');
		}
	});	
}]);
nextsepta.module('nextsepta').controller('map', ['module', 'data', 'map_locate', 'map_vehicles', 'map_markers', 'map_vectors', '$elem', 
	function(module, data, locate, vehicles, markers, vectors, $elem) {
		var $inner = $('.js-map-inner', $elem),
			settings = {
				tiles_id: 'reedlauber.map-55lsrr7u',
				retina_tiles_id: 'reedlauber.map-1j4vhxof',
				center: {
					lat: 39.9523350,
					lng: -75.163789
				},
				zoom: 16
			},
			initialized = false,
			self = {},
			map,
			routes_layer;

		function set_center(lat, lng, zoom) {
			lat = lat || settings.center.lat;
			lng = lng || settings.center.lng;
			zoom = zoom || settings.zoom;

			self.map.setView([lat, lng], zoom);
		}

		function adjust_size() {
			var height = $(window).height() - $('.js-app-header').outerHeight() - $('.js-app-footer').outerHeight();
			$inner.height(height);
			$elem.css('top', $('.js-app-header').outerHeight());
		}

		function initialize_map() {
			if(!initialized && $elem.is(':visible')) {
				adjust_size();

				self.map = window.MAP = L.mapbox.map($inner.attr('id'), settings.tiles_id, {
					detectRetina: true,
					retinaVersion: settings.retina_tiles_id
				});

				self.map.on('moveend', function() {
					module.emit('map-moveend', []);
				});

				markers.set_map_ctrl(self, $elem);
				vectors.set_map_ctrl(self, $elem);
				locate.set_map_ctrl(self, $elem);
				vehicles.set_map_ctrl(self, $elem);

				set_center();

				initialized = true;
			}
		}

		module.on('content-settings-changed', function(evt, settings) {
			if(settings.map) {
				initialize_map();

				markers.clear();
				vectors.clear();
				locate.disable();
				vehicles.disable();

				if(settings.map_locate) {
					locate.locate();
				}

				if(settings.route_type && settings.route_id) {
					vectors.add_route(settings.route_type, settings.route_id, !settings.map_vehicle);
					vehicles.add_vehicles(settings.route_type, settings.route_id, settings.map_vehicle);
				}
			} else {
				locate.disable();
				vehicles.disable();
			}
		});

		self.set_center = set_center;
		self.add_marker = markers.add;
		self.move_marker = markers.move;
		self.remove_marker = markers.remove;
		self.clear_markers = markers.clear;
		self.add_vector = vectors.add;
		self.clear_vectors = vectors.clear;
	}
]);

nextsepta.module('nextsepta').controller('options', ['$elem', function($elem) {
	var $recent = $('.js-options-recent-trips', $elem),
		$saved = $('.js-options-saved-trips', $elem);

	$saved.on('click', '.js-options-delete-saved', function() {
		var $link = $(this),
			key = $link.parent().attr('data-trip-key');

		$.ajax({
			url: '/saved-trips/' + key,
			method: 'DELETE',
			dataType: 'json',
			success: function(resp) {
				$('[data-trip-key="' + key + '"] .js-options-save-disabled', $recent)
					.removeClass('js-options-save-disabled disabled')
					.removeAttr('disabled')
					.addClass('btn-add js-options-save-recent')
					.val('Save');

				$link.parent().remove();

				if(!$('li', $saved).length) {
					$('ul', $saved).append('<li class="simple-nav-item js-options-saved-trips-none">No saved trips yet.</li>');
				}
			}
		});
	});

	$recent.on('click', '.js-options-save-recent', function() {
		var $link = $(this),
			key = $link.parent().attr('data-trip-key');

		$.ajax({
			url: '/saved-trips/' + key,
			method: 'POST',
			dataType: 'json',
			success: function(resp) {
				$link.removeClass('btn-add js-options-save-recent')
					.addClass('js-options-save-disabled disabled')
					.attr('disabled', 'disabled')
					.val('Saved');

				$('.js-options-saved-trips-none', $saved).remove();
				$('<li data-trip-key="' + key + '">' + 
						'<input type="button" class="btn btn-small btn-danger btn-right js-options-delete-saved" value="Delete" />' + 
					'</li>')
					.appendTo($('ul', $saved))
					.prepend($link.parent().find('a').clone());
			}
		});
	});

	$('.js-options-clear-recent', $elem).click(function() {
		$.ajax({
			url: '/recent-trips/',
			method: 'DELETE',
			dataType: 'json',
			success: function(resp) {
				$('.js-options-recent-trips', $elem).remove();
			}
		});
	});
}]);
nextsepta.module('nextsepta').controller('trips', ['module', 'templates', 'data', '$elem', function(module, templates, data, $elem) {
	var prevKey = '0',
		$list = $('.js-trips-list', $elem),
		cache = {
			'0': $('li:first', $list)
		},
		time_intervals = [{ l:'week', s:604800 }, { l:'day', s:86400 }, { l:'hr', s:3600 }, { l:'min', s:60 }],
		stops = [],
		vehicles = {};

	$list.height($list.outerHeight());

	function get_relative_time(diff) {
		if(diff < 0) {
			return '(GONE)';
		} else if(diff < 60) {
			return '(< 1m)';
		} else {
			var s = '', v = 0;
			time_intervals.forEach(function(inv, i) {
				if(diff > inv.s) {
					v = Math.floor(diff / inv.s);
					if(s) {
						s += ' ';
					}
					s += v + inv.l[0];
					diff = diff % inv.s;
				}
			});
			return '(' + s + ')';
		}
	}

	function timer() {
		var now = new Date();
		$.each(stops, function(i, stop) {
			var diff = (stop.time - now) / 1000;
			stop.el.html(get_relative_time(diff));
			if(diff < 0) {
				stop.el.parents('.trip').addClass('gone');
			}
		});
		if(stops.length) {
			setTimeout(function() {
				timer();
			}, 15000);
		}
	}

	function update_realtime(route_type, route_id) {
		$('.trip', $list).each(function() {
			var block_id = $(this).attr('data-block-id');

			if(block_id && block_id in vehicles) {
				var vehicle = vehicles[block_id],
					map_url = ['', route_type, route_id, 'map'].join('/') + '?vehicle=' + vehicle.vehicle_id;

				$(this).addClass('has-vehicle');
				$('.icon-map-marker', this).attr('href', map_url);
			}
		});
	}

	function get_realtime_data(route_type, route_id) {
		if(route_id) {
			data.get(['', route_type, route_id, 'locations'].join('/'), function(resp) {
				vehicles = {};
				if(resp && resp.vehicles) {
					resp.vehicles.forEach(function(vehicle) {
						vehicles[vehicle.block_id] = vehicle;
					});
				}
				update_realtime(route_type, route_id);
			});
		}
	}

	function get_scroll_to($link, forward, cacheKey, callback) {
		if(cacheKey in cache) {
			callback(cache[cacheKey]);
		} else {
			templates.get($link.attr('href') + '&layout=false&itemsonly=true', function(items) {
				items = $.trim(items || '');
				if(items) {
					var $items = $('<ul>' + items + '</ul>');
					if(forward) {
						var count = $('li', $list).length;
						$list.append(items);
						cache[cacheKey] = $('li:eq(' + count + ')', $list);
					} else {
						$list.prepend(items);
						cache[cacheKey] = $('li:first', $list);
						$list.scrollTo(cache[prevKey]);
					}
					callback(cache[cacheKey]);
				}
			});
		}
	}

	$('.js-trips-prev, .js-trips-next', $elem).click(function() {
		var forward = $(this).hasClass('js-trips-next'),
			cacheKey = $(this).attr('href').replace('?offset=', ''),
			offset = parseInt(cacheKey, 10);

		if(offset || offset === 0) {
			get_scroll_to($(this), forward, cacheKey, function(scrollTo) {
				$list.scrollTo(cache[cacheKey], 500);
				prevKey = cacheKey;
				$('.js-trips-prev', $elem).attr('href', '?offset=' + (offset - 5));
				$('.js-trips-next', $elem).attr('href', '?offset=' + (offset + 5));
			});
		}

		return false;
	});

	if(module.data('route-type') !== 'subways') {
		get_realtime_data(module.data('route-type'), module.data('route-id'));
	}

	$('.trip').each(function() {
		var ts = $(this).attr('data-departure-time'),
			relText = $('.trip-from-now', this);

		if(ts) {
			var date_parts = ts.split(/[- :]/),
				dt = new Date(date_parts[0], date_parts[1]-1, date_parts[2], date_parts[3], date_parts[4], '00');

			if(dt) {
				stops.push({ time:dt, el:relText });
			}
		}
	});

	timer();
}]);