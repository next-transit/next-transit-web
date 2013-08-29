function before(req, res, next) {
	var cookie_settings = { maxAge:(1000 * 60 * 60 * 24 * 365.4) },
		recent_trips = req.cookies.recent_trips || [],
		saved_trips = req.cookies.saved_trips || [],
		last_trip;

	if(req.route_type && req.direction && req.from_stop) {
		var pieces = [req.route_type.slug, req.route.slug, req.direction.direction_id, req.from_stop.stop_id];

		if(req.to_stop) {
			pieces.push(req.to_stop.stop_id);
		}

		var trip_key = pieces.join('-'),
			path = '/' + pieces.join('/');

		last_trip = {
			key: trip_key,
			path: path,
			slug: req.route.slug,
			route_type: req.route_type.slug,
			route_name: req.route.route_name,
			direction_name: req.direction.direction_name,
			from_stop_name: req.from_stop.stop_name,
			to_stop_name: (req.to_stop || {}).stop_name,
			count: 1
		};

		var match_idx = -1;
		recent_trips.forEach(function(existing_trip, idx) {
			if(existing_trip.key === trip_key) {
				match_idx = idx;
			}
		});

		if(match_idx > -1) {
			last_trip.count = recent_trips[match_idx].count + 1; // Maybe in the future we can sort by popularity or something
			recent_trips.splice(match_idx, 1);
		}

		recent_trips.unshift(last_trip);
	}

	res.cookie('recent_trips', recent_trips, cookie_settings);

	var top_trips = [];
	recent_trips.forEach(function(recent_trip, idx) {
		if(idx < 5) {
			saved_trips.forEach(function(saved_trip) {
				if(saved_trip.key === recent_trip.key) {
					recent_trip.saved = true;
				}
			});
			top_trips.push(recent_trip);
		}
	});
	req.recent_trips = top_trips;
	if(last_trip) {
		req.session.last_trip = last_trip;	
	}

	next();
};

function remove(req, res, callback) {
	if(req.params.key) {
		var trips = req.cookies.recent_trips || [],
			remove_idx = -1;

		trips.forEach(function(trip, idx) {
			if(trip.key === req.params.key) {
				remove_idx = idx;
			}
		});

		if(remove_idx > -1) {
			trips.splice(remove_idx, 0);
			res.cookie('recent_trips', trips, cookie_settings);
		}
	} else {
		res.cookie('recent_trips', []);
	}

	if(typeof callback === 'function') {
		callback();	
	}
}

module.exports = {
	before: before,
	remove: remove
};