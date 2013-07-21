var home = require('./controller').create('home');

home.action('index', function(req, res, callback) {
	var route_types = [
		{ id:'bsl', label:'Broad Street Line', path:'/subways/bss' },
		{ id:'mfl', label:'Market-Frankford Line', path:'/subways/mfl' },
		{ id:'buses', label:'Buses', path:'/buses' },
		{ id:'trolleys', label:'Trolley Lines', path:'/trolleys' },
		{ id:'trains', label:'Regional Rail', path:'/trains' }
	];

	callback({ route_types:route_types });
});

module.exports = home;