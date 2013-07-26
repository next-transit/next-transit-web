nextsepta.module('nextsepta').service('history', [function() {
	if(!window.history) {
		return {};
	}

	var $back_btn,
		$options_btn;

	function applyContentSettings(title, show_back, show_options) {
		$('.js-title, .js-app-title').text(title || 'NEXT|Septa');
		$back_btn[show_back ? 'addClass' : 'removeClass']('active');
		$options_btn[show_options ? 'addClass' : 'removeClass']('active');
	}

	function parseContentSettings(content, callback) {
		var title = 'NEXT|Septa', show_back = true, show_options = true,
			matches = content.match(/<!-- (title: ([\w\|]+));? ?(back: ?([\w]+))?;? ?(options: ?([\w]+))? -->/i);

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

	function renderContent(content, path, push) {
		parseContentSettings(content, function(title, show_back, show_options) {
			if(push) {
				history.pushState({ title:title, back:show_back, options:show_options }, '', path);
			}
			applyContentSettings(title, show_back, show_options);
			$('.content').html(content);
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

	$(function() {
		$back_btn = $('.js-nav-link-back').click(function() {
			history.back();
			return false;
		});
		$options_btn = $('.js-header-options-btn');

		attachEvents();

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