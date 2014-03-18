var ctrl = require('./controller').create('locations');

ctrl.action('index', { json:true }, function(req, res, callback) {
	try {
		var agency_realtime = require('../realtime/agencies/' + req.agency.slug);

		agency_realtime.get_locations(req).then(function(vehicles) {
			callback({ vehicles:vehicles });
		}, function(err) {
			res.error(err);
		});
	} catch(e) {
		res.internal_error('Couldn\'t load agency realtime library.');
	}
});

module.exports = ctrl;
