var ctrl = require('./controller').create('routes'),
	routes = require('../models/routes');

ctrl.action('index', function(req, res, callback) {
	routes.where('route_type = ?', [req.route_type_id]).done(function(rts) {
		routes.sort_by_short_name(rts);
		callback({ title:req.route_type.label, path:req.route_type.slug, routes:rts });
	});
});

module.exports = ctrl;