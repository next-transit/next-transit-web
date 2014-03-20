var route_types = require('./model').create('route_types', { cache:true }),
	MODES = {
		'0': 'tram',
		'1': 'subway',
		'2': 'rail',
		'3': 'bus',
		'4': 'ferry',
		'5': 'cable',
		'6': 'gondola',
		'7': 'funicular'
	};

route_types.get_mode = function(route_type_id) {
	return MODES[route_type_id.toString()] || 'unknown';
};

module.exports = route_types;
