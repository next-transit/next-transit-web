if(process.env.NODETIME_ACCOUNT_KEY) {
	require('nodetime').profile({ accountKey:process.env.NODETIME_ACCOUNT_KEY, appName:process.env.NODETIME_ACCOUNT_NAME });
}

require('date-utils');

var express = require('express'),
	hbs = require('hbs'),
	router = require('./lib/router'),
	port = process.env.PORT || 5000;

hbs.registerPartials('./app/templates/partials', function() {});

var app = express();

app.set('view engine', 'hbs');
app.set('views', './app/templates');
app.use(express.static('./app'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({ secret:'bsl-mfl' }));

router.routes(app);

app.listen(port);
console.log('Server started on port', port);