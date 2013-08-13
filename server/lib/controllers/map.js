var ctrl = require('./controller').create('map');

ctrl.action('index', function(req, res, callback) {
	callback({ title:'Map', show_map:true });
});

module.exports = ctrl;