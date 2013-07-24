var ctrl = require('./controller').create('options'),
	saved_trips = require('../models/saved_trips');

ctrl.action('index', function(req, res, callback) {
	var recent_trips = req.recent_trips || [],
		has_recent_trips = !!recent_trips.length;

	saved_trips.query(req, res, function(saved_trips) {
		callback({ title:'Options', has_recent_trips:has_recent_trips, recent_trips:recent_trips, saved_trips:saved_trips, has_saved_trips:!!saved_trips.length });
	});
});

module.exports = ctrl;