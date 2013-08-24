var noop = function(record) { return record; },
	transforms = {};

transforms.stops = function(record) {
	record.parent_station = record.parent_station || 0;
	record.zone_id = parseInt(record.zone_id, 10) || 0;
};

transforms.trips = function(record) {
	record.block_id = record.block_id || 0;
};

module.exports = {
	get_transform: function(type) {
		return transforms[type] || noop
	}
};