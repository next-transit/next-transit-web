var ctrl = require('./controller').create('map');

ctrl.action('index', function(req, res, callback) {
	callback({ show_map:true, title:'Map' });
});

ctrl.action('route', function(req, res, callback) {
	callback({ show_map:true, locate:'false' });
});

ctrl.action('locate', function(req, res, callback) {
	callback({ show_map:true, locate:'true' });
});

module.exports = ctrl;