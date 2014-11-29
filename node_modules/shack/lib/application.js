var extend = require('extend'),
	router = require('./router')();

var exports = module.exports = {};

exports.init = function(app) {
	app.init();
	extend(app, this);
	app.use(router.middleware(app));
};

exports.before = function(fn) {
	router.befores.push(fn);
};

exports.after = function(fn) {
	router.afters.push(fn);
};
