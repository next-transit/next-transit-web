require('date-utils');

var express = require('express'),
	hbs = require('hbs'),
	db = require('./lib/db'),
	router = require('./lib/router'),
	routes = require('./lib/models/routes'),
	port = 4000;

hbs.registerPartials('../app/templates/partials');

var app = express();

app.set('view engine', 'hbs');
app.set('views', '../app/templates');
app.use(express.static('../app'));

router.routes(app);

app.listen(port);
console.log('Server started on port', port);