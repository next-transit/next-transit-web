var ctrl = require('./controller').create('patterns');

ctrl.action('index', function(req, res, callback) {
	callback({});
});

module.exports = ctrl;