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