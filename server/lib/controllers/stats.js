var promise = require('promise'),
	date_utils = require('date-utils'),
	ctrl = require('./controller').create('stats'),
	stats = require('../models/stats'),
	models = [
		{ label:'Routes', model_name:'routes' },
		{ label:'Directions', model_name:'directions' },
		{ label:'Stop Times', model_name:'stop_times' },
		{ label:'Stops', model_name:'stops' },
		{ label:'Trips', model_name:'trips' },
		{ label:'Simplified Stops', model_name:'simplified_stops' },
		{ label:'Trip Variants', model_name:'trip_variants' },
		{ label:'Shapes', model_name:'shapes' }
	];

function format_count(count) {
	var str = count.toString(),
		reversed = str.split('').reverse().join('') + '00',
		groups = reversed.match(/\d{3}/g),
		with_commas = groups.join(','),
		with_commas_full = with_commas + reversed.substr(with_commas.length - (groups.length - 1)),
		complete = with_commas_full.split('').reverse().join('').substr(2);
	return complete;
}

function get_model_count(agency_id, model_name) {
	return promise(function(resolve, reject) {
		var model = require('../models/' + model_name);
		model.query()
			.error(reject)
			.where('agency_id = ?', [agency_id])
			.count(function(count) {
				count = count || 0;
				resolve(function(data) {
					data.counts.push({
						model_name: model_name.replace('_', ' '), 
						count: count, 
						formatted_count: format_count(count)
					});
				});
			});
	});
}

function get_stats(agency_id) {
	return promise(function(resolve, reject) {
		stats.where('agency_id = ?', [agency_id])
			.orders('created_at DESC')
			.error(reject)
			.done(function(stats) {
				var processed = [];
				stats.forEach(function(stat) {
					var stat_fields = [];
					models.forEach(function(model) {
						stat_fields.push({
							label: model.label,
							count: stat[model.model_name + '_count'] || 0,
							formatted_count: format_count(stat[model.model_name + '_count'] || 0)
						});
					});
					processed.push({
						created_at: stat.created_at.toFormat('D MMM, YYYY'),
						process_seconds: stat.process_seconds,
						fields: stat_fields
					});
				});

				resolve(function resolve_stats(data) {
					data.stats = processed;
				});
			});
	});
}

ctrl.action('index', function(req, res, callback) {
	var data = { title:'Stats', counts:[], models:models },
		promises = [get_stats(req.agency.id)];

	promise.all(promises).then(function(results) {
		results.forEach(function(result) {
			result(data);
		});
		//data.current = data.stats.pop();
		callback(data);
	}, function(err) {
		console.log('Error getting model counts', err);
		callback(data);
	});
});

module.exports = ctrl;