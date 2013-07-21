var curry = require('curry'),
	trim = require('trim'),
	date_format = 'YYYY-MM-DD';

function dateFromTime(dt, time) {
	var parts = time.split(':');
	if(parts.length > 1) {
		var hours = parseInt(parts[0], 10),
			minutes = parseInt(parts[1], 10);

		var date = dt.clone();
		date.clearTime();
		date.add({ hours:hours, minutes:minutes });
		return date;
	}
}

function formatTime(dt, time, format) {
	return dateFromTime(dt, time).toFormat(format);
}

function normalize24HrTime(time) {
	if(typeof time === 'string') {
		time = trim(time);

		var parts = time.split(':'),
			hour = parseInt(parts[0], 10);

		if(parts.length >= 2 && hour > 23) {
			time = '0' + (hour - 24) + ':' + parts[1] + ':00';
		}	
	}
	return time;
}


function time_period(period) {
	var interval_array = [{ label:'w', time:604800 }, { label:'d', time:86400 }, { label:'h', time:3600 }, { label:'m', time:60 }],
		time_str = '';

	period = period / 1000; // convert to seconds

	if(period < 0) {
		time_str = 'GONE'
	} else if(period < 60) {
		time_str = '< 1m'
	} else {
		interval_array.forEach(function(interval) {
			if(period >= interval.time) {
				var time_val = Math.floor(period / interval.time);
				
				period -= time_val * interval.time;

				if(time_str) {
					time_str += ' ';
				}

				time_str += time_val + interval.label;
			}
		});
	}

	return time_str;
}

function DateUtil(dt) {
	var self = this;
	this.CLASS = 'DateUtil';
	this._dt = dt || new Date();
	this.getDay = function() { return this._dt.getDay(); };
	this.getHours = function() { return this._dt.getHours(); };
	this.toFormat = function(format) { return this._dt.toFormat(format); };
	this.add = function(toAdd) { this._dt.add(toAdd); return self; };
	this.dateFromTime = curry(dateFromTime)(this._dt);
	this.formatTime = curry(formatTime)(this._dt);
	this.normalize24HrTime = normalize24HrTime;
	this.time_period = time_period;
}

function date(dt) {
	return new DateUtil(dt);
}

date.dateFromTime = dateFromTime;
date.formatTime = formatTime;
date.normalize24HrTime = normalize24HrTime;
date.time_period = time_period;

module.exports = date;