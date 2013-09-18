var http = require('http'),
	promise = require('promise'),
	ctrl = require('./controller').create('locations'),
	trips = require('../models/trips');

function get_trip_by_block_id(agency_id, block_id, callback) {
	block_id = parseInt(block_id, 10);
	trips.where('agency_id = ? AND block_id = ?', [agency_id, block_id]).first(function(trip) {
		if(typeof callback === 'function') {
			callback(trip);
		}
	});
}

function normalize_buses(agency_id, res, callback) {
	var buses = [],
		res_data,
		res_buses;

	if(res) {
		try {
			res_data = JSON.parse(res);
		} catch(e) {
			console.log('Error parsing buses realtime JSON: ', e);
		}

		if(res_data) {
			res_buses = res_data['bus'];
			res_buses.forEach(function(bus) {
				buses.push({
					mode: 'bus',
					lat: bus.lat,
					lng: bus.lng,
					vehicle_id: bus.VehicleID,
					offset: bus.Offset,
					block_id: bus.BlockID,
					destination: bus.destination,
					direction: bus.Direction,
					late: null
				});
			});
		}
	}

	callback(buses);
}

function normalize_rail(agency_id, res, callback) {
	var promises = [],
		res_data,
		res_trains;

	if(res) {
		try {
			res_data = JSON.parse(res);
		} catch(e) {
			console.log('Error parsing rail realtime JSON: ', e);
		}

		if(res_data) {
			res_data.forEach(function(train) {
				promises.push(new promise(function(resolve, reject) {
					get_trip_by_block_id(agency_id, train.trainno, function(trip) {
						resolve({
							mode: 'rail',
							lat: train.lat,
							lng: train.lon,
							vehicle_id: train.trainno,
							offset: 0,
							block_id: 0,
							destination: train.dest,
							late: train.late,
							route_id: (trip ? trip.route_id : '')
						});
					});
				}));
			});
		}
	}

	promise.all(promises).done(function(trains) {
		callback(trains);
	});
}

ctrl.action('index', { json:true }, function(req, res, callback) {
	var realtime_url = req.route.is_rail 
		? 'http://www3.septa.org/hackathon/TrainView/'
		: 'http://www3.septa.org/transitview/bus_route_data/' + req.route_id;

	http.get(realtime_url, function(res) {
		res.setEncoding('utf8');

		var data = '';
		res.on('data', function(chunk) {
			data += chunk;
		}).on('end', function() {
			var normalize_fn = req.route.is_rail ? normalize_rail : normalize_buses;

			normalize_fn(req.agency.id, data, function(vehicles) {
				callback({ vehicles:vehicles });
			});
		});
	}).on('error', function() {
		callback({});
	});
});

module.exports = ctrl;