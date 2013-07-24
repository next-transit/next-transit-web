var ctrl = require('./controller').create('recent-trips'),
	recent_trips = require('../models/recent_trips');

ctrl.action('delete', { json:true }, function(req, res, callback) {
	recent_trips.remove(req, res, function() {
		callback({ success:true });
	});
});

module.exports = ctrl;