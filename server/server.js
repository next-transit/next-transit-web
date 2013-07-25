require('date-utils');

var express = require('express'),
	hbs = require('hbs'),
	db = require('./lib/db'),
	router = require('./lib/router'),
	routes = require('./lib/models/routes'),
	port = 5000;

hbs.registerPartials('./app/templates/partials', function() {});

var app = express();

app.set('view engine', 'hbs');
app.set('views', './app/templates');
app.use(express.static('./app'));
app.use(express.cookieParser());
app.use(express.cookieSession({ secret:'bsl-mfl' }));

//router.routes(app);
app.get('/', function(req, res) {
	res.send('testing...');
});

app.listen(port);
console.log('Server started on port', port);