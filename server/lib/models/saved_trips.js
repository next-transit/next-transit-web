var cookie_settings = { maxAge:(1000 * 60 * 60 * 24 * 365.4) };

function save(req, res, callback) {
	if(req.params.key) {
		var recent_trips = req.cookies.recent_trips || [],
			saved_trips = req.cookies.saved_trips || [];

		var trip;
		recent_trips.forEach(function(recent_trip) {
			if(recent_trip.key === req.params.key) {
				trip = recent_trip;
			}
		});

		if(trip) {
			var existing_idx = -1;
			saved_trips.forEach(function(saved_trip, idx) {
				if(saved_trip.key === trip.key) {
					existing_idx = idx;
				}
			});
			if(existing_idx > -1) {
				saved_trips.splice(existing_idx, 1);
			}
			saved_trips.unshift(trip);
			res.cookie('saved_trips', saved_trips, cookie_settings);
			callback(trip);
		} else {
			callback();
		}
	} else {
		callback();
	}
}

function query(req, res, callback) {
	callback(req.cookies.saved_trips || []);
}

function remove(req, res, callback) {
	if(req.params.key) {
		var saved_trips = req.cookies.saved_trips || [],
			remove_idx = -1;

		saved_trips.forEach(function(saved_trip, idx) {
			if(saved_trip.key === req.params.key) {
				remove_idx = idx;
			}
		});

		if(remove_idx > -1) {
			saved_trips.splice(remove_idx, 1);
			res.cookie('saved_trips', saved_trips, cookie_settings);
			callback(true);
		} else {
			callback();
		}
	}
	callback();
}

module.exports = {
	save: save,
	query: query,
	remove: remove
};