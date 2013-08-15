var route_types = {
	trolleys: { id:'0', label:'Trolleys', slug:'trolleys', color:'#539442' },
	subways: { id:'1', label:'Subways', slug:'subways', color:'#477997' },
	trains: { id:'2', label:'Regional Rail', slug:'trains', color:'#477997' },
	buses: { id:'3', label:'Buses', slug:'buses', color:'#41525c' },
	bss: { color:'#f58220' },
	mfl: { color:'#107dc1' }
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