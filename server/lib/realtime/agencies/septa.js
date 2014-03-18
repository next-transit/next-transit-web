var promise = require('promise'),
	realtime = require('../'),
	trips = require('../../models/trips'),
	septa = {},
	REALTIME_RAIL_URL = 'http://www3.septa.org/hackathon/TrainView/', // This trailing slash is require. Don't ask why
	REALTIME_BUS_URL = 'http://www3.septa.org/transitview/bus_route_data';

function get_trip_by_block_id(agency_id, block_id) {
	block_id = parseInt(block_id, 10);
	return trips.api_query('/trips', { block_id:block_id });
}

function normalize_buses(data) {
	return new promise(function(resolve, reject) {
		var buses = [];

		if(data) {
			data.bus.forEach(function(bus) {
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

		resolve(buses);
	});
}

function normalize_rail(agency_id, data) {
	return new promise(function(resolve, reject) {
		var promises = [],
			res_trains;

		if(data) {
			data.forEach(function(train) {
				promises.push(new promise(function(resolve, reject) {
					get_trip_by_block_id(agency_id, train.trainno).then(function(trips) {
						var trip = trips[0];
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
					}, reject);
				}));
			});
		}

		promise.all(promises).done(resolve);
	});
}

function get_bus_locations(req) {
	return new promise(function(resolve, reject) {
		var url = REALTIME_BUS_URL + '/' + req.route_id;

		realtime.request(url).then(function(data) {
			normalize_buses(data).then(resolve, reject);
		}, reject);
	});
}

function get_rail_locations(req) {
	return new promise(function(resolve, reject) {
		realtime.request(REALTIME_RAIL_URL).then(function(data) {
			normalize_rail(req.agency.id, data).then(resolve, reject);
		}, reject);
	});
}

septa.get_locations = function(req) {
	var realtime_fn = req.route.is_rail ? get_rail_locations : get_bus_locations;

	return realtime_fn(req);
};

module.exports = septa;
