var routes = require('./model').create('routes', { cache:true });

routes.sort_by_short_name = function(routes) {
	routes.sort(function(a, b) {
		a.cid = a.cid || pad_left(a.route_short_name, 4, '0');
		b.cid = b.cid || pad_left(b.route_short_name, 4, '0');

		if(a.cid < b.cid) {
			return -1;
		} else if(a.cid > b.cid) {
			return 1;
		}
		return 0;
	});
};

module.exports = routes;