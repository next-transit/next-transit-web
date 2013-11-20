var simplified_stops = require('./model').create('simplified_stops', { cache:true });

simplified_stops.get = function(route_id, direction_id, stop_id) {
	return simplified_stops.api_query('/routes/' + route_id + '/directions/' + direction_id + '/stops/' + stop_id);
};

module.exports = simplified_stops;