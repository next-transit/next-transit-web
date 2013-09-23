var fs = require('fs'),
	csv = require('csv'),
	promise = require('promise'),
	date_utils = require('date-utils'),
	timer = require('./timer'),
	routes = require('../models/routes'),
	directions = require('../models/directions'),
	shapes = require('../models/shapes'),
	simplified_shapes = require('../models/simplified_shapes'),
	simplified_stops = require('../models/simplified_stops'),
	trip_variants = require('../models/trip_variants'),
	stats = require('../models/stats'),
	options;

function write_data(data, write_path, columns, custom_timer) {
	return new promise(function(resolve, reject) {
		var write_stream = fs.createWriteStream(write_path, { flags:'w' }),
			date_str = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

		csv()
			.from(data)
			.to(write_stream, { delimiter:'\t', columns:columns })
			.transform(function(record, idx) {
				record.created_at = record.updated_at = date_str;
				record.agency_id = options.agency.id;
				return record;
			})
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
			write_path = options.stage_path + '/' + file_name + '.txt',
			extended_columns = (columns || []).concat(['created_at', 'updated_at', 'agency_id']);

		process(file_name, extended_columns, write_path, custom_timer).then(resolve, reject);
	});
}

function import_route_extras(file_name, columns, write_path, custom_timer) {
	return new promise(function(resolve, reject) {
		directions.generate_directions(options.agency.id).then(function(new_directions) {
			custom_timer.interval('Time spent reading source file', true).start();
			write_data(new_directions, write_path, columns, custom_timer).then(function(count) {
				directions.import(options.agency.id, columns, write_path, resolve, reject);
			}, reject);
		}, reject);
	});
}

function import_route_shapes(file_name, columns, write_path, custom_timer) {
	return new promise(function(resolve, reject) {
		simplified_shapes.generate_route_shapes(options.agency.id, options.verbose).then(function(new_shapes) {
			custom_timer.interval('Time spent reading shapes from trips', true).start();
			write_data(new_shapes, write_path, columns, custom_timer).then(function(count) {
				simplified_shapes.import(options.agency.id, columns, write_path, resolve, reject);
			}, reject);
		}, reject);
	});
}

function import_simplified_stops(file_name, columns, write_path, custom_timer) {
	return new promise(function(resolve, reject) {
		simplified_stops.generate_stops(options.agency.id).then(function(new_simplified_stops) {
			custom_timer.interval('Time spent reading source file', true).start();
			write_data(new_simplified_stops, write_path, columns, custom_timer).then(function(count) {
				simplified_stops.import(options.agency.id, columns, write_path, resolve, reject);
			}, reject);
		}, reject);
	});
}

function import_trip_variants(file_name, columns, write_path, custom_timer) {
	return new promise(function(resolve, reject) {
		trip_variants.generate_variants(options.agency.id).then(function(new_trip_variants) {
			custom_timer.interval('Time spent reading source file', true).start();
			write_data(new_trip_variants, write_path, columns, custom_timer).then(function(count) {
				trip_variants.import(options.agency.id, columns, write_path, resolve, reject);
			}, reject);
		}, reject);
	});
}

function generate_stats() {
	return new promise(function(resolve, reject) {
		var models = ['shapes', 'stops', 'routes', 'directions', 'simplified_stops', 'trips', 'trip_variants', 'stop_times', 'simplified_shapes'],
			promises = [],
			get_model_count = function get_model_count(model_name) {
				return promise(function(resolve, reject) {
					var model = require('../models/' + model_name);
					model.query()
						.error(reject)
						.where('agency_id = ?', [options.agency.id])
						.count(function(count) {
							if(count) {
								resolve({ model_name:model_name, count:count });
							} else {
								resolve({ model_name:model_name, count:0 });
							}
						});
				});
			};

		models.forEach(function(model_name) {
			promises.push(get_model_count(model_name));
		});

		promise.all(promises).then(function(model_counts) {
			var stats_data = {
				agency_id: options.agency.id,
				created_at: new Date().toFormat('YYYY-MM-DD HH24:MI:SS'), 
				process_seconds: 0
			};

			model_counts.forEach(function(model_count) {
				stats_data[model_count.model_name + '_count'] = model_count.count;
			});

			stats.insert(stats_data, resolve, reject);
		}, reject);
	});
}

function custom_importer(opts) {
	options = opts;
	return {
		import_route_extras: function(file_name, columns) {
			return import_custom('Generating Route Directions', import_route_extras, file_name, columns);
		},
		import_route_shapes: function(file_name, columns) {
			return import_custom('Generating Route Shapes', import_route_shapes, file_name, columns);
		},
		import_simplified_stops: function(file_name, columns) {
			return import_custom('Generating Simplified Stops', import_simplified_stops, file_name, columns);
		},
		import_trip_variants: function(file_name, columns) {
			return import_custom('Generating Trip Variants', import_trip_variants, file_name, columns);
		},
		generate_stats: function(file_name, columns) {
			return import_custom('Generating Import Stats', generate_stats, file_name, columns);
		}
	};
}

module.exports = function(options) {
	return custom_importer(options);
};