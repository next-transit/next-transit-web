require('date-utils');

var express = require('express'),
	db = require('./lib/db'),
	router = require('./lib/router'),
	routes = require('./lib/models/routes'),
	port = 4000;

var app = express();

app.set('view engine', 'hbs');
app.set('views', '../app/templates');
app.use(express.static('../app'));

app.locals({
	title: 'NEXT-Septa'
});

router.routes(app);

app.listen(port);
console.log('Server started on port', port);