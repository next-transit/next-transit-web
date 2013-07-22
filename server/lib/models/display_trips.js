var promise = require('promise'),
	date = require('../util/date'),
	stop_times = require('./stop_times'),
	time_format = 'H:MI P';

function DisplayTrip(stop_time) {
	stop_time = stop_time || {};
	this.trip_id = stop_time.trip_id || '';
	this.block_id = stop_time.block_id || '';
	this.departure_stop_time = stop_time || null;
	this.departure_time_formatted = '';
	this.arrival_stop_time = null;
	this.arrival_time_formatted = '';
	this.from_now = '';
	this.gone = false;
	this.coverage = {
		left: ((stop_time.first_stop_sequence - 1) / stop_time.stop_count) * 100,
		right: (1 - (stop_time.last_stop_sequence / stop_time.stop_count)) * 100
	};

	if(this.coverage.left < 0) {
		this.coverage.left = 0;
	}
	if(this.coverage.right < 0) {
		this.coverage.right = 0;
	}

	this.coverage.full = !this.coverage.left && !this.coverage.right;
}

function addToStopTime(now, trip, to_stop) {
	return new promise(function(resolve, reject) {
		if(to_stop) {
			stop_times.query().where('trip_id = ? AND stop_id = ?', [trip.trip_id, to_stop.stop_id]).first(function(to_stop_time) {
				if(to_stop_time) {
					trip.arrival_stop_time = to_stop_time;
					trip.arrival_time_formatted = now.dateFromTime(to_stop_time.departure_time).toFormat(time_format);
				}
				resolve(trip);
			});
		} else {
			resolve(trip);	
		}
	});
}

function convert(now, stop_time, to_stop) {
	var trip = new DisplayTrip(stop_time),
		departure_datetime = now.dateFromTime(stop_time.departure_time),
		diff = departure_datetime - now._dt;

	trip.departure_time_formatted = departure_datetime.toFormat(time_format);
	trip.from_now = now.time_period(diff);
	trip.gone = trip.from_now === 'GONE';

	return addToStopTime(now, trip, to_stop);
}

function convert_list(stop_times, to_stop, callback) {
	var now = date(), 
		promises = [];

	stop_times.forEach(function(stop_time) {
		promises.push(convert(now, stop_time, to_stop));
	});

	promise.all(promises).done(function(trips) {
		callback(trips);
	});
}

var trips = {};

trips.get_by_time = function(is_rail, route_id, direction_id, from_id, offset, to_stop, success, error) {
	stop_times.get_by_time(is_rail, route_id, direction_id, from_id, offset, function(times) {
		convert_list(times, to_stop, function(trips) {
			success(trips);
		});
	}, error);
};

module.exports = trips;