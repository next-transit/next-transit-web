var http = require('http'),
	ctrl = require('./controller').create('locations');

function normalize_buses(res) {
	var buses = [],
		res_data,
		res_buses;

	if(res) {
		res_data = JSON.parse(res);

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
					late: null
				});
			});
		}
	}

	return buses;
}

function normalize_rail(res) {
	var trains = [],
		res_data,
		res_trains;

	if(res) {
		res_data = JSON.parse(res);
		if(res_data) {
			res_data.forEach(function(train) {
				trains.push({
					mode: 'rail',
					lat: train.lat,
					lng: train.lng,
					vehicle_id: train.trainno,
					offset: 0,
					block_id: 0,
					destination: train.dest,
					late: train.late
				});
			});
		}
	}
}

ctrl.action('index', { json:true }, function(req, res, callback) {
	var realtime_url = req.route.is_rail 
		? 'http://www3.septa.org/hackathon/TrainView/'
		: 'http://www3.septa.org/transitview/bus_route_data/' + req.route_id;

	http.get(realtime_url + req.route_id, function(res) {
		res.setEncoding('utf8');

		var data = '';
		res.on('data', function(chunk) {
			data += chunk;
		}).on('end', function() {
			var normalize_fn = req.route.is_rail ? normalize_rail : normalize_buses,
				vehicles = normalize_fn(data);

			callback({ vehicles:vehicles });
		});
	}).on('error', function() {
		callback({});
	});
});

module.exports = ctrl;