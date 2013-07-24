var route_types = {
	trolleys: { id:'0', label:'Trolleys', slug:'trolleys' },
	subways: { id:'1', label:'Subways', slug:'subways' },
	trains: { id:'2', label:'Regional Rail', slug:'trains' },
	buses: { id:'3', label:'Buses', slug:'buses' }
};

route_types.get_by_id = function(id) {
	var route_type;

	for(var type in route_types) {
		if(route_types[type].id === id.toString()) {
			route_type = route_types[type];
		}
	}

	return route_type;
};

module.exports = route_types;