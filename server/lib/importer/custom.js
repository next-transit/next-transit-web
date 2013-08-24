var fs = require('fs'),
	csv = require('csv'),
	promise = require('promise'),
	timer = require('./timer'),
	routes = require('../models/routes'),
	directions = require('../models/directions'),
	shapes = require('../models/shapes'),
	simplified_stops = require('../models/simplified_stops'),
	trip_variants = require('../models/trip_variants'),
	gtfs_path = __dirname + '/../../../assets/gtfs',
	stage_path = gtfs_path + '/stage';

function write_data(data, write_path, columns, custom_timer) {
	return new promise(function(resolve, reject) {
		var write_stream = fs.createWriteStream(write_path, { flags:'w' });

		csv()
			.from(data)
			.to(write_stream, { delimiter:'\t', columns:columns })
			.on('end', function() {
				write_stream.end();
			})
			.on('error', reject);

		write_stream.on('finish', function() {
			custom_timer.interval('Time spent writing to database', true);
			resolve();
		});
	});
}

function import_custom(title, process, file_name, columns) {
	return new promise(function(resolve, reject) {
		var custom_timer = timer('\n' + title, true),
			write_path = stage_path + '/' + file_name + '.txt';

		process(file_name, columns, write_path, custom_timer).then(resolve, reject);
	});
}

function import_route_extras(file_name, columns, write_path, custom_timer) {
	return new promise(function(resolve, reject) {
		directions.generate_directions().then(function(new_directions) {
			custom_timer.interval('Time spent reading source file', true).start();
			write_data(new_directions, write_path, columns, custom_timer).then(function(count) {
				directions.import(columns, write_path, resolve, reject);
			}, reject);
		}, reject);
	});
}

function import_route_shapes(file_name, columns, write_path, custom_timer) {
	return new promise(function(resolve, reject) {
		shapes.update('route_id = ?', ['']).error(reject).commit(function() {
			custom_timer.interval('Time spent reading source file', true).start();
			shapes.assign_route_shapes().then(resolve, reject);
		});
	});
}

function import_simplified_stops(file_name, columns, write_path, custom_timer) {
	return new promise(function(resolve, reject) {
		simplified_stops.generate_stops().then(function(new_simplified_stops) {
			custom_timer.interval('Time spent reading source file', true).start();
			write_data(new_simplified_stops, write_path, columns, custom_timer).then(function(count) {
				simplified_stops.import(columns, write_path, resolve, reject);
			}, reject);
		}, reject);
	});
}

function import_trip_variants(file_name, columns, write_path, custom_timer) {
	return new promise(function(resolve, reject) {
		trip_variants.generate_variants().then(function(new_trip_variants) {
			custom_timer.interval('Time spent reading source file', true).start();
			write_data(new_trip_variants, write_path, columns, custom_timer).then(function(count) {
				trip_variants.import(columns, write_path, resolve, reject);
			}, reject);
		}, reject);
	});
}

module.exports = {
	import_route_extras: function(file_name, columns) {
		return import_custom('Generating Route Directions', import_route_extras, file_name, columns);
	},
	import_route_shapes: function(file_name, columns) {
		return import_custom('Generating Route Shapes', import_route_shapes, file_name, columns);
	},
	import_simplified_stops: function(file_name, columns) {
		return import_custom('Generating Simplified Shapes', import_simplified_stops, file_name, columns);
	},
	import_trip_variants: function(file_name, columns) {
		return import_custom('Generating Trip Variants', import_trip_variants, file_name, columns);
	}
};