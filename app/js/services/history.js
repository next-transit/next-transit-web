nextsepta.module('nextsepta').service('history', ['resize', function(resize) {
	if(!window.history) {
		return {};
	}

	var $back_btn,
		$options_btn,
		$content;

	function applyContentSettings(title, show_back, show_options) {
		$('.js-title, .js-app-title').text(title || 'NEXT|Septa');
		$('.js-title').text(title ? (title + ' - NEXT|Septa') : 'NEXT|Septa');
		$back_btn[show_back ? 'addClass' : 'removeClass']('active');
		$options_btn[show_options ? 'addClass' : 'removeClass']('active');
	}

	function parseContentSettings(content, callback) {
		var title = 'NEXT|Septa', show_back = true, show_options = true,
			matches = content.match(/<!-- (title: ([\w\|\- ]+));? ?(back: ?([\w]+))?;? ?(options: ?([\w]+))? -->/i);

		if(matches) {
			if(matches.length > 1) {
				title = matches[2];
			}
			if(matches.length > 3) {
				show_back = matches[4] !== 'false';
			}
			if(matches.length > 5) {
				show_options = matches[6] !== 'false';
			}
		}

		callback(title, show_back, show_options);
	}

	function animateContent(content, slide_right) {
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

		var $current = $('.content-panel', $content).addClass(['current', going].join(' ')),
			$next = $('<div class="content-panel"></div>').addClass(['incoming', incoming_side].join(' ')).append(content).appendTo($content);

		$current.animate(animate_current, function() {
			$current.remove();
		});
		$next.animate(animate_incoming, function() {
			$next.removeClass('incoming right left').css(incoming_direction, 'auto');
		});
	}

	function renderContent(content, path, push) {
		parseContentSettings(content, function(title, show_back, show_options) {
			if(push) {
				history.pushState({ title:title, back:show_back, options:show_options }, '', path);
			}
			applyContentSettings(title, show_back, show_options);

			if(resize.is_desktop()) {
				$content.hide().html('<div class="content-panel">' + content + '</div>').fadeIn('fast');
			} else {
				animateContent(content, !push);
			}
			eval();
		});
	}

	function getContent(url, success) {
		var url_parts = url.split('?'),
			query = '?' + (url_parts[1] ? url_parts[1] + '&' : '') + 'layout=false';

		$.ajax({
			url: url_parts[0] + query,
			method: 'GET',
			dataType: 'html',
			success: function(content) {
				success(content, url);
			}
		});
	}

	// Looks for ".js-nav-link" elements and binds an override to History
	function attachEvents($context) {
		$context = $context || $('body');
		$('.js-nav-link', $context).click(function() {
			var path = $(this).attr('href');
			getContent(path, function(content, path) {
				renderContent(content, path, true);
			});
			return false;
		});
	}

	// Evaluates html for "directives" and attaches history event handlers
	function eval($context) {
		$context = $context || $content;
		nextsepta.module('nextsepta').eval($context);
		attachEvents($context);
	} 

	// Initial event binding for links and window.History
	$(function() {
		// Bind custom events for the "back" and "options" buttons
		$back_btn = $('.js-nav-link-back').click(function() {
			history.back();
			return false;
		});
		$options_btn = $('.js-header-options-btn');

		// Get persistent "content" wrapper element
		$content = $('.content');

		// Do initial event bindings for whatever we have to start with
		attachEvents();

		// Event listener for browser back button clicks
		var first_pop = true;
		$(window).bind('popstate', function(evt) {
			if(first_pop) { first_pop = false; return; }
			getContent(window.location.pathname, renderContent);
		});
	});

	return {
		eval: function($elem) {
			attachEvents($elem);
		}
	};
}]);