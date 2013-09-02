var ctrl = require('./controller').create('routes'),
	routes = require('../models/routes');

ctrl.action('index', function(req, res, callback) {
	routes.query(req.agency.id)
		.where('agency_id = ? AND route_type = ?', [req.agency.id, req.route_type_id])
		.done(function(rts) {
			routes.sort_by_short_name(rts);
			callback({ title:req.route_type.label, routes:rts });
		});
});

module.exports = ctrl;