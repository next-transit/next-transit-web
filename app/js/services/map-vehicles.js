nextsepta.module('nextsepta').service('map_vehicles', ['data', 'history', function(data, history) {
	var active = false,
		initialized = false,
		vehicles = {},
		track_interval,
		map_ctrl,
		icons = {
			bus: 'bus-36',
			rail: 'rail-36'
		},
		direction_icons = {
			NorthBound: 'icon-caret-up',
			EastBound: 'icon-caret-right',
			SouthBound: 'icon-caret-down',
			WestBound: 'icon-caret-left'
		},
		$map;

	function add_vehicle_markers(route_type, route_id, vehicle_id, vehicles_to_track) {
		var center_on_vehicle = vehicles_to_track.length === 1;

		map_ctrl.clear_markers();

		vehicles_to_track.forEach(function(vehicle) {
			var direction_icon = vehicle.direction ? ' <span class="' + direction_icons[vehicle.direction] + '"></span>' : '',
				early_late = vehicle.late < 0 ? 'early' : 'late',
				title = '',
				late = 0;

			if(vehicle.late !== null) {
				late = Math.abs(vehicle.late);
				title = late + ' ' + (late === 1 ? 'min' : 'mins') + ' ' + early_late;
			} else {
				title = vehicle.offset + ' ' + (vehicle.offset === '1' ? 'min' : 'mins') + ' ago' + direction_icon;
			}

			map_ctrl.add_marker(vehicle.lat, vehicle.lng, {
				id: 'vehicle-' + vehicle.vehicle_id, 
				icon: icons[vehicle.mode], 
				title: title, 
				center: center_on_vehicle,
				zoom: 16,
				message: title
			}).on('click', function() {
				if(!vehicle_id) {
					history.push('/' + route_type + '/' + route_id + '/map?vehicle=' + vehicle.vehicle_id);	
				}
			});
			vehicles[vehicle.vehicle_id] = vehicle;
		});

		function exists(id) {
			var found = false;
			vehicles_to_track.forEach(function(vehicle) {
				if(vehicle.vehicle_id === id) {
					found = true;
				}
			});
			return found;
		}

		// Clear markers that have dropped out
		for(var id in vehicles) {
			if(!exists(id)) {
				map_ctrl.remove_marker('vehicle-' + id);
				delete vehicles[id];
			}
		}
	}

	function get_vehicles(route_type, route_id, vehicle_id) {
		data.get('/' + route_type + '/' + route_id + '/locations', function(resp) {
			if(resp && resp.vehicles) {
				var vehicles_to_track = [];
				resp.vehicles.forEach(function(resp_vehicle) {
					if(!vehicle_id || resp_vehicle.vehicle_id === vehicle_id) {
						vehicles_to_track.push(resp_vehicle);
					}
				});

				add_vehicle_markers(route_type, route_id, vehicle_id, vehicles_to_track);
			}
		});
	}

	function add_vehicles(route_type, route_id, vehicle_id) {
		if(route_type, route_id) {
			active = true;

			start_tracking(route_type, route_id, vehicle_id);
		}
	}

	function start_tracking(route_type, route_id, vehicle_id) {
		vehicles = {};
		track_interval = setInterval(function() {
			get_vehicles(route_type, route_id, vehicle_id);
		}, 1000 * 30); // 30 secs
		get_vehicles(route_type, route_id, vehicle_id);
	}

	function stop_tracking() {
		if(track_interval) {
			clearInterval(track_interval);
			track_interval = null;
		}
	}

	function initialize() {
		if(!initialized) {
			initialized = true;
		}
	}

	return {
		add_vehicle: add_vehicles,
		add_vehicles: add_vehicles,
		set_map_ctrl: function(ctrl, $map_elem) {
			map_ctrl = ctrl;
			$map = $map_elem;

			initialize();
		},
		disable: function() {
			active = false;
			stop_tracking();
		}
	};
}]);