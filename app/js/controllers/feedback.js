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