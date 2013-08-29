var pg = require('pg'),
	config = require('../util/config'),
	connString = config.database_url;

function query(query, params, success, error) {
	pg.connect(connString, function(err, client, done) {
		if(err) {
			return console.error('Could not connect to postgres', err);
		}
		if(typeof params === 'function') {
			error = success;
			sucess = params;
			params = [];
		}

		client.query(query, params, function(err, result) {
			if(err) {
				if(typeof error === 'function') {
					error(err);
				}
				return console.error('Error running query', query, '\n', err);
			}
			if(typeof success === 'function') {
				success(result);
			}
			done();
		});
	});
};

module.exports = {
	query: query
};
