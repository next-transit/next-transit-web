var promise = require('promise'),
	date_utils = require('date-utils'),
	ctrl = require('./controller').create('stats'),
	stats = require('../models/stats', { cache:true }),
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

ctrl.action('index', function(req, res, callback) {
	stats.api_query('/stats').then(function(data) {
		var processed = [];
		data.forEach(function(stat) {
			var created_at = new Date(Date.parse(stat.created_at)),
				stat_fields = [];
			models.forEach(function(model) {
				stat_fields.push({
					label: model.label,
					count: stat[model.model_name + '_count'] || 0,
					formatted_count: format_count(stat[model.model_name + '_count'] || 0)
				});
			});
			processed.push({
				created_at: created_at.toFormat('D MMM, YYYY'),
				process_seconds: stat.process_seconds,
				fields: stat_fields
			});
		});
		callback({ title:'Status', stats:processed });
	}, res.internal_error);
});

module.exports = ctrl;