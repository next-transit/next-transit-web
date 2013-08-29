var fs = require('fs'),
	promise = require('promise'),
	csv = require('csv'),
	trim = require('trim'),
	date_utils = require('date-utils'),
	timer = require('./timer'),
	transforms = require('./transforms'),
	sequential = require('./sequential'),
	config = require('../util/config'),
	batch_size = 100000,
	options;

function copy_to_database(file_name, model, columns, success, error) {
	model.import(options.agency.id, columns, file_name, function() {
		if(typeof success === 'function') {
			success();
		}
	}, error);
}

function import_path(type, read_path, write_stream, model, columns) {
	return new promise(function(resolve, reject) {
		var transform = transforms.get_transform(type),
			date_str = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

		csv()
			.from(read_path, { columns:true, trim:true })
			.to(write_stream, { delimiter:'\t', columns:columns })
			.transform(function(record, idx) {
				if(idx && (idx % batch_size === 0)) {
					console.log('Processed ' + idx + ' so far ...');
				}
				record.created_at = record.updated_at = date_str;
				record.agency_id = options.agency.id;
				transform(record);
				return record;
			})
			.on('end', function() {
				resolve();
			})
			.on('error', function(err) {
				console.error('Error reading source file', err);
				reject();
			});
	});
}

function add_path_sequence(first, path, file_name, write_path, model, columns) {
	return function(next, error) {
		var flags = first ? 'w' : 'a',
			read_path = path + '/' + file_name + '.txt',
			write_stream = fs.createWriteStream(write_path, { flags:flags });

		if(!first) {
			write_stream.write('\n');
		}

		import_path(file_name, read_path, write_stream, model, columns).then(function() {
			write_stream.end();
		}, error);

		write_stream.on('finish', function() {
			next();
		});
	};
}

function importer(opts) {
	options = opts;

	var self = {},		
		paths = (options.agency.import_paths || '/').split(',');

	self.import_type = function import_type(title, file_name, columns) {
		return new promise(function(resolve, reject) {
			var model = require('../models/' + file_name),
				total_timer = timer('\nImporting ' + title, true),
				read_timer = timer(),
				write_timer = timer(),
				extended_columns = columns.concat(['created_at', 'updated_at', 'agency_id']);

			total_timer.start();

			var sequencer = sequential(),
				read_path = '',
				write_path = options.gtfs_path + '/stage/' + file_name + '.txt',
				first = true;

			read_timer.start();

			paths.forEach(function(path) {
				path = options.gtfs_path + trim(path);
				sequencer.add(add_path_sequence(first, path, file_name, write_path, model, extended_columns));
				first = false;
			});

			sequencer.then(function() {
				read_timer.stop();

				write_timer.start('Writing bulk file to database ...');
				copy_to_database(write_path, model, extended_columns, function() {
					read_timer.total('Time spent reading source files');
					write_timer.interval('Time spent writing to database', true);
					total_timer.interval(title + ' Import Complete! Total time', true, true, '-');
					resolve();
				}, function(err) {
					console.log('Error copying data to database', err);
					reject();
				});
			});
		});
	};

	return self;
}

module.exports = function(options) {
	return importer(options);
};