var promise = require('promise'),
	date_utils = require('date-utils'),
	sequential = require('./lib/importer/sequential')(),
	timer = require('./lib/importer/timer'),
	importer = require('./lib/importer/importer'),
	custom = require('./lib/importer/custom'),
	config = require('./lib/util/config'),
	agencies = require('./lib/models/agencies'),
	columns = {
		shapes: ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence'],
		stops: ['stop_id', 'stop_name', 'stop_lat', 'stop_lon', 'location_type', 'parent_station', 'zone_id'],
		trips: ['route_id', 'service_id', 'trip_id', 'trip_headsign', 'block_id', 'direction_id', 'trip_short_name', 'shape_id'],
		stop_times: ['trip_id', 'arrival_time', 'departure_time', 'stop_id', 'stop_sequence'],
		routes: ['route_id', 'route_short_name', 'route_long_name', 'route_type', 'route_color', 'route_text_color', 'route_url'],
		directions: ['route_id', 'route_short_name', 'direction_id', 'direction_name', 'direction_long_name'],
		simplified_stops: ['route_id', 'route_direction_id', 'direction_id', 'stop_id', 'stop_sequence', 'stop_name', 'stop_lat', 'stop_lon'],
		simplified_shapes: ['route_id', 'segment_id', 'shape_id', 'shape_pt_lat', 'shape_pt_lon'],
		trip_variants: ['route_id', 'direction_id', 'trip_headsign', 'stop_count', 'variant_name', 'first_stop_sequence', 'last_stop_sequence']
	},
	mode = 'all',
	type = 'all',
	agency_arg,
	verbose = false;

process.on('uncaughtException', function(err) {
	console.log(new Error('Uncaught exception: ' + err).stack);
	process.exit(1);
});

process.argv.forEach(function(arg) {
	var parts = arg.split(':');
	if(parts[0] === 'agency') {
		agency_arg = parts[1];
	} else if(parts[0] === 'type') {
		type = parts[1] || 'all';
	} else if(parts[0] === '-v') {
		verbose = true;
	}
});

if(!agency_arg) {
	console.log('No Agency argument provided.');
	process.exit(1);
	return;
}

agencies.where('slug = ?', [agency_arg]).first(function(agency) {
	if(agency) {
		var gtfs_path = __dirname + '/../assets/gtfs/' + agency.slug,
			stage_path = gtfs_path + '/stage',
			importer_options = { agency:agency, verbose:verbose, gtfs_path:gtfs_path, stage_path:stage_path },
			gtfs_importer = importer(importer_options),
			custom_importer = custom(importer_options),
			total_timer = timer();

		function add_type(import_type, file_name, custom_type) {
			return function(next, error) {
				if(type === 'all' || type === file_name) {
					if(custom_type) {
						custom_importer[custom_type](file_name, columns[file_name]).then(next, error);
					} else {
						gtfs_importer.import_type(import_type, file_name, columns[file_name]).then(next, error);	
					}
				} else {
					next();
				}
			};
		}

		sequential
			.add(add_type('Shapes', 'shapes'))
			.add(add_type('Stops', 'stops'))
			.add(add_type('Trips', 'trips'))
			.add(add_type('Stop Times', 'stop_times'))
			.add(add_type('Routes', 'routes'))
			.add(add_type('Route Directions', 'directions', 'import_route_extras'))
			.add(add_type('Route Shapes', 'simplified_shapes', 'import_route_shapes'))
			.add(add_type('Simplified Stops', 'simplified_stops', 'import_simplified_stops'))
			.add(add_type('Trip Variants', 'trip_variants', 'import_trip_variants'))
			.add(add_type('Stats', 'stats', 'generate_stats'))
			.then(function() {
				total_timer.interval('\nImport complete! Total time:', true, true, '!');
				process.exit(0);
			}, function(err) {
				console.log('Import failed');
				console.log(err.stack);
				process.exit(1);
			});
	} else {
		console.log('Agency was not found.');
		process.exit(1);
	}
});
