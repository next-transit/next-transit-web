var http = require('http'),
	extend = require('extend'),
	promise = require('promise'),
	config = require('../util/config'),
	cache = require('../util/cache');

function Model(model_name, options) {
	this.CLASS = 'Model';
	this.table = model_name;
	this.model_name = model_name;
	this.options = options || { cache:false };
}

Model.prototype.toString = function() {
	return this.CLASS + '[' + this.model_name + ']';
};

function get_data(path, params, options) {
	options = options || {};
	params = params || {};
	params.api_key = config.data_api_key;

	var params_array = [];
	for(var name in params) {
		params_array.push(name + '=' + params[name].toString());
	}

	if(params_array.length) {
		path += '?' + params_array.join('&');
	}

	return new promise(function(resolve, reject) {
		if(options.cache && cache.contains(path)) {
			resolve(cache.get(path).data);
		} else {
			if(config.verbose) {
				console.log('API query', path);
			}
			http.get(config.data_url + path, function(res) {
				res.setEncoding('utf8');

				var data = '';
				res.on('data', function(chunk) {
					data += chunk;
				}).on('end', function() {
					var data_obj = JSON.parse(data);
					if(options.cache) {
						cache.put(path, data_obj);
					}
					resolve(data_obj.data);
				});
			}).on('error', reject);
		}
	});
}

Model.prototype.api_query = function(path, params, options) {
	return get_data(path, params, extend({ cache:this.options.cache }, this.options, options));
};

Model.prototype.get = function(resource_id) {
	return get_data('/' + this.model_name + '/' + resource_id, null, { cache:this.options.cache });
};

Model.prototype.all = function() {
	return get_data('/' + this.model_name, null, { cache:this.options.cache });
};

module.exports = {
	Model: Model,
	create: function(table, options) {
		return new Model(table, options);
	}
};