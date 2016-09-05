require('date-utils');

var express = require('express'),
	shack = require('shack'),
	hbs = require('hbs'),
	app_ctrl = require('./lib/controllers/app'),
	recent_trips = require('./lib/models/recent_trips'),
	port = process.env.PORT || 5000;

hbs.registerPartials('./app/templates/partials', function() {});

var app = shack();

app.set('view engine', 'hbs');
app.set('views', './app/templates');
app.set('routes', __dirname + '/../config/routes');
app.set('controllers', __dirname + '/lib/controllers');

app.use(express.static('./app'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({ secret:'bsl-mfl' }));
app.before(app_ctrl());
app.before(recent_trips.before());
app.after(shack.request_logger());

app.listen(port);
console.log('Server started on port', port);
