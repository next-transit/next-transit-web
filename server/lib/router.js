var routes = require('../routes.json');

function addRoutes(app) {
	for(var path in routes) {
		var appCntl = require('./controllers/app'),
			ctrlName = routes[path],
			ctrlParts = ctrlName.split(':'),
			cntl = require('./controllers/' + ctrlParts[0]),
			action = cntl.getAction(ctrlParts[1] || 'index');

		appCntl.app(app);

		app.get(path, appCntl.before, action);
	}
}

module.exports = {
	routes: addRoutes
};