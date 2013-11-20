var directions = require('./model').create('route_directions', { cache:true });

directions.get = function(route_id, direction_id) {
	return directions.api_query('/routes/' + route_id + '/directions/' + direction_id);
};

module.exports = directions;