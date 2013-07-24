var ctrl = require('./controller').create('saved-trips'),
	saved_trips = require('../models/saved_trips');

ctrl.action('create', { json:true }, function(req, res, callback) {
	saved_trips.save(req, res, function(saved_trip) {
		if(saved_trip) {
			callback({ success:true, saved_trip:saved_trip });	
		} else {
			res.send(404, { success:false });
		}
	});
});

ctrl.action('delete', { json:true }, function(req, res, callback) {
	saved_trips.remove(req, res, function(removed) {
		if(removed) {
			callback({ success:true });
		} else {
			res.send(404, { success:false });
		}
	});
});

module.exports = ctrl;