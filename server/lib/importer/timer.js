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

function Timer(message) {
	var start,
		old = 0;

	this.start = function(message) {
		start = new Date();
		if(message) {
			console.log(message);
		}
	};

	this.stop = function() {
		old += (new Date() - start) / 1000;
	};

	this.total = function(message, stop_first) {
		if(stop_first) {
			this.stop();
		}
		
		var formatted = format_time(old);

		console.log(message + ': ' + formatted);
	};

	this.interval = function(message, stop) {
		var elapsed = (new Date() - start) / 1000,
			formatted = format_time(elapsed);

		console.log(message + ': ' + formatted);

		if(stop) {
			this.stop();
		}
	};

	this.start(message);
}

module.exports = function(message) {
	return new Timer(message);
};