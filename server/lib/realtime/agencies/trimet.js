var http = require('http'),
	querystring = require('querystring'),
	promise = require('promise'),
	config = require('../../util/config'),
	route_types = require('../../models/route_types'),
	realtime = require('../'),
	trimet = {},
	REALTIME_URL = 'http://developer.trimet.org/beta/v2/vehicles';

function get_request_url(req) {
	var params = {
			appID: '606DD5685EEC20DACC9E720B4',
			routes: req.route.route_id
		};

	return REALTIME_URL + '?' + querystring.stringify(params);
}

function normalize(req, data) {
	var vehicles = [];

	if(data) {
		data.resultSet.vehicle.forEach(function(datum) {
			vehicles.push({
				mode: route_types.get_mode(req.route_type.route_type_id),
				lat: datum.latitude,
				lng: datum.longitude,
				vehicle_id: datum.vehicleID.toString(),
				block_id: datum.blockID,
				destination: datum.signMessageLong,
				direction: datum.direction,
				offset: null,
				late: 0 - Math.floor(datum.delay / 60)
			});
		});
	}

	return vehicles;
}

trimet.get_locations = function(req) {
	return new promise(function(resolve, reject) {
		realtime.request(get_request_url(req)).then(function(data) {
			resolve(normalize(req, data));
		}, reject);
	});
};

module.exports = trimet;
