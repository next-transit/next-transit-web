var ctrl = require('./controller').create('map');

ctrl.action('index', function(req, res, callback) {
	callback({ show_map:true, locate:'false', title:'Map', back_path:'/' });
});

ctrl.action('route', function(req, res, callback) {
	callback({ show_map:true, locate:'false', title:'Route Map', vehicle:req.query.vehicle });
});

ctrl.action('locate', function(req, res, callback) {
	callback({ show_map:true, locate:'true', title:'Locate', back_path:'/' });
});

module.exports = ctrl;