var routes = require('../routes.json'),
	app_cntl = require('./controllers/app'),
	recent_trips = require('./models/recent_trips');

function addRoutes(app) {
	for(var key in routes) {

		var path = key,
			options = routes[key],
			ctrlName = options.action,
			ctrlParts = ctrlName.split(':'),
			cntl = require('./controllers/' + ctrlParts[0]),
			method = 'get',
			action = cntl.getAction(ctrlParts[1] || 'index'),
			method_matches = key.match(/^(get|post|put|delete) /i);

		if(method_matches) {
			path = key.replace(method_matches[0], '');
			method = method_matches[1];
		}

		app[method](path, app_cntl.before, recent_trips.before, action);
	}
}

module.exports = {
	routes: addRoutes
};