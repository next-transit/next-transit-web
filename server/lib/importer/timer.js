function format_time(secs) {
	var hrs = 0,
		mins = 0,
		time = '';

	if(secs > 1) {
		secs = Math.floor(secs);	
	}

	if(secs > 59) {
		mins = Math.floor(secs / 60);
		secs = secs - (mins * 60);
	}
	if(mins > 59) {
		hrs = Math.floor(mins / 60);
		mins = mins - (hrs * 60);
	}
	if(hrs > 0) {
		time = hrs + ' hours ';
	}
	if(mins > 0) {
		time += mins + ' minutes ';
	}
	time += secs + ' seconds';
	return time;
}

function message(msg, wrap, wrap_char) {
	if(msg) {
		if(wrap) {
			wrap_char = wrap_char || '*';
			var len = msg.length + 4,
				border = '',
				first_char = '';

			if(msg[0] === '\n') {
				first_char = '\n';
				msg = msg.substr(1);
				len--;
			}

			while(len--) {
				border += wrap_char;
			}
			msg = [first_char, '\n', border, '\n', wrap_char, ' ', msg, ' ', wrap_char, '\n', border, '\n'].join('');
		}
		console.log(msg);
	}
}

function Timer(msg, wrap, wrap_char) {
	var self = this,
		start,
		old = 0;

	self.get_seconds = function() {
		return (new Date() - start) / 1000;
	};

	self.start = function(msg, wrap, wrap_char) {
		start = new Date();
		message(msg, wrap, wrap_char);
		return self;
	};

	self.stop = function() {
		old += self.get_seconds();
		return self;
	};

	self.total = function(msg, stop_first, wrap, wrap_char) {
		if(stop_first) {
			self.stop();
		}
		
		var formatted = format_time(old);

		message(msg + ': ' + formatted, wrap, wrap_char);
		return self;
	};

	self.interval = function(msg, stop, wrap, wrap_char) {
		var elapsed = self.get_seconds(),
			formatted = format_time(elapsed);

		message(msg + ': ' + formatted, wrap, wrap_char);

		if(stop) {
			self.stop();
		}
		return self;
	};

	self.start(msg, wrap, wrap_char);
}

module.exports = function(message, wrap, wrap_char) {
	return new Timer(message, wrap, wrap_char);
};