nextsepta.module('nextsepta').controller('trips', ['$elem', 'templates', function($elem, templates) {
	var prevKey = '0',
		$list = $('.js-trips-list', $elem),
		cache = {
			'0': $('li:first', $list)
		};

	$list.height($list.outerHeight());

	function getScrollTo($link, forward, cacheKey, callback) {
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
			getScrollTo($(this), forward, cacheKey, function(scrollTo) {
				$list.scrollTo(cache[cacheKey], 500);
				prevKey = cacheKey;
				$('.js-trips-prev', $elem).attr('href', '?offset=' + (offset - 5));
				$('.js-trips-next', $elem).attr('href', '?offset=' + (offset + 5));
			});
		}

		return false;
	});
}]).run();