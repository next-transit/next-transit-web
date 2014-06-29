nextsepta.module('nextsepta', ['templates', 'history', 'content_settings']).controller('app', ['module', '$elem', function(module, $elem) {
	var $content = $('.js-content', $elem);

	module.data('route-type', $content.attr('data-route-type'));
	module.data('route-id', $content.attr('data-route-id'));
	module.data('agency-slug', $elem.attr('data-agency-slug'));
}]).run();
