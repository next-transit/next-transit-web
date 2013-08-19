var ctrl = require('./controller').create('content');

ctrl.action('about', function(req, res, callback) {
	callback('about', { title:'About' });
});

ctrl.action('help', function(req, res, callback) {
	callback('help', { title:'Help' });
});

module.exports = ctrl;