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
			var dt = new Date(Date.parse(ts));
			if(dt && !$.isNumeric(dt)) {
				stops.push({ time:dt, el:relText });
			}
		}
	});

	timer();
}]);