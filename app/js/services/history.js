nextsepta.module('nextsepta').service('history', ['resize', 'content_settings', function(resize, settings) {
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
		$footer[settings.footer ? 'addClass' : 'removeClass']('active');
		$map[settings.map ? 'addClass' : 'removeClass']('active');
		$content[settings.map ? 'removeClass' : 'addClass']('hidden');
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

			if(resize.is_desktop()) {
				$content.hide().html('<div class="content-panel js-content-panel">' + content + '</div>').fadeIn('fast');
			} else {
				animate_content(content, !push);
			}
			eval();
		});
	}

	function get_content(url, success) {
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
	function attach_events($context) {
		$context = $context || $('body');
		$('.js-nav-link', $context).click(function() {
			var path = $(this).attr('href');
			get_content(path, function(content, path) {
				render_content(content, path, true);
			});
			return false;
		});
	}

	// Evaluates html for "directives" and attaches history event handlers
	function eval($context) {
		$context = $context || $content;
		nextsepta.module('nextsepta').eval($context);
		attach_events($context);
	} 

	// Initial event binding for links and window.History
	$(function() {
		// Bind custom events for the "back" and "options" buttons
		$back_btn = $('.js-nav-link-back').click(function() {
			history.back();
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
		eval: function($elem) {
			attach_events($elem);
		}
	};
}]);