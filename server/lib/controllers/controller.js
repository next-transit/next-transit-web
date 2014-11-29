var shack = require('shack');

function prerender(req, view_data) {
	var app_title = req.locals.app_title || 'NEXT|Transit';

	if(view_data.title) {
		view_data.page_title = view_data.title;
		view_data.title += ' - ' + app_title;
	} else {
		view_data.title = view_data.page_title = view_data.app_title;
	}
}

function next_transit_controller(name) {
	return shack.controller(name, { prerender:prerender });
}

module.exports = {
	create: next_transit_controller
};
