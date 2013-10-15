var ctrl = require('./controller').create('patterns');

ctrl.action('index', function(req, res, callback) {
	callback({ title:'UI Patterns', show_footer:false });
});

module.exports = ctrl;