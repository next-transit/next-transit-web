nextsepta.module('nextsepta').controller('trips', ['module', 'templates', 'data', '$elem', function(module, templates, data, $elem) {
	var prevKey = '0',
		$list = $('.js-trips-list', $elem),
		cache = {
			'0': $('li:first', $list)
		},
		vehicles = {};

	$list.height($list.outerHeight());

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
}]);