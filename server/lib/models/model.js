var utils = require('./utils'),
	db = require('../db');

function Model(table) {
	this.CLASS = 'Model';
	this.table = table;
}

function execute_query(sql, params, success, error) {
	db.query(sql, params, function(result) {
		if(typeof success === 'function') {
			success(result.rows);
		}
	}, error);
}

function swap_params(sql, params) {
	var i = 0, len = params.length, idx, pg_var;
	for(; i < len; i++) {
		idx = sql.indexOf('?');
		if(idx === -1) {
			throw new Error('More expected values provided than params spots.');
		}

		pg_var = '$' + (i+1);

		sql = sql.substr(0, idx) + pg_var + sql.substr(idx+1);
	}
	return sql;
}

function generate_sql(table, select, joins, where, params, group_bys, orders, limit, offset) {
	var sql = 'SELECT ' + (select || '*') + ' FROM ' + table;

	if(joins) {
		sql += ' ' + joins.trim();
	}

	if(where) {
		sql += ' WHERE ' + where;
	}

	if(group_bys) {
		sql += ' GROUP BY ' + group_bys;
	}

	if(orders && typeof orders === 'string') {
		sql += ' ORDER BY ' + orders;
	}

	if(params) {
		sql = swap_params(sql, params);
	}

	if(typeof limit === 'number') {
		sql += ' LIMIT ' + limit;
	}

	if(typeof offset === 'number') {
		sql += ' OFFSET ' + offset;
	}

	sql += ';';

	return sql;
}

function generate_update_sql(table, set, params, where) {
	var sql = 'UPDATE ' + table;

	sql += ' SET ' + set;

	if(where) {
		sql += ' WHERE ' + where;
	}

	if(params) {
		sql = swap_params(sql, params);
	}

	sql += ';';

	return sql;
}

function generate_insert_sql(table, data, callback) {
	var sql = 'INSERT INTO ' + table,
		columns = [],
		value_params = [],
		values = [];

	for(var field in data) {
		if(data.hasOwnProperty(field)) {
			columns.push(field);
			value_params.push('?');
			values.push(data[field]);
		}
	}

	sql += ' (' + columns.join(', ') + ') values (' + value_params.join(', ') + ');';
	sql = swap_params(sql, values);

	callback(sql, values);
}

Model.prototype.select = function(select, joins, where, params, orders, limit, offset, success, error) {
	if(typeof joins === 'function') {
		error = where;
		success = joins;
		offset = null;
		limit = null;
		orders = null;
		params = null;
		where = null;
		joins = null;
	} else if(typeof where === 'function') {
		error = params;
		success = where;
		offset = null;
		limit = null;
		orders = null;
		params = null;
		where = null;
	} else if(typeof params === 'function') {
		error = orders;
		success = params;
		offset = null;
		limit = null;
		orders = null;
		params = null;
	} else if(typeof orders === 'function') {
		error = limit;
		success = orders;
		offset = null;
		limit = null;
		orders = null;
	} else if(typeof limit === 'function') {
		error = offset;
		success = limit;
		offset = null;
		limit = null;
	} else if(typeof offset === 'function') {
		error = success;
		success = offset;
		offset = null;
	}

	var sql = generate_sql(this.table, select, joins, where, params, null, orders, limit, offset);

	execute_query(sql, params, success, error);
};

Model.prototype.process = function(agency_id, data, callback) {
	callback(data);
};

Model.prototype.all = function(success, error) {
	Model.prototype.query.call(this).where('').error(error).done(success);
};

Model.prototype.where = function(where, params) {
	return Model.prototype.query.call(this).where(where, params);
};

Model.prototype.query = function(agency_id) {
	var query = {}, model = this, joins = [], q = {};

	function fn(param) {
		return function(val) {
			q[param] = val;
			return query;
		};
	}

	query.select = fn('select');
	query.params = fn('params');
	query.orders = fn('orders');
	query.group_by = fn('group_by');
	query.limit = fn('limit');
	query.error = fn('error');
	query.offset = fn('offset');
	query.where = function(where, params) {
		q.where = where;
		if(params) {
			q.params = params;
		}
		return query;
	};
	query.join = function(join) {
		joins.push(join);
		q.joins = joins.join(' ');
		return query;
	};

	query.done = function(callback, no_process) {
		var sql = generate_sql(model.table, q.select, q.joins, q.where, q.params, q.group_by, q.orders, q.limit, q.offset);
		execute_query(sql, q.params, function(results) {
			if(results && results.length) {
				if(no_process) {
					callback(results);
				} else {
					model.process(agency_id, results, callback);	
				}
			} else {
				callback([]);
			}
		}, q.error);
	};

	query.first = function(callback, no_process) {
		var sql = generate_sql(model.table, q.select, q.joins, q.where, q.params, q.group_by, q.orders, q.limit, q.offset);
		execute_query(sql, q.params, function(results) {
			if(results && results.length) {
				if(no_process) {
					callback(results[0]);
				} else {
					model.process(agency_id, results[0], callback);	
				}
			} else {
				callback();
			}
		}, q.error);
	};

	query.count = function(callback) {
		query.select('count(*) as the_count')
			.first(function(result) {
				var count;
				if(result) {
					count = parseInt(result.the_count);
				}
				callback(count);
			}, true);
	};

	return query;
};

Model.prototype.update = function(set, params) {
	var query = {}, model = this, sets = [], q = {};

	function fn(param) {
		return function(val) {
			q[param] = val;
			return query;
		};
	}

	query.error = fn('error');

	function add_params(params) {
		if(q.params) {
			q.params = q.params.concat(params);
		} else {
			q.params = params;
		}
	}

	query.set = function(set, params) {
		sets.push(set);
		q.set = sets.join(', ');
		add_params(params);
		return query;
	};

	query.where = function(where, params) {
		q.where = where;
		add_params(params);
		return query;
	};

	query.commit = function(callback) {
		var sql = generate_update_sql(model.table, q.set, q.params, q.where);
		execute_query(sql, q.params, function() {
			callback();
		}, q.error);
	};

	if(set) {
		query.set(set, params);
	}

	return query;
};

Model.prototype.insert = function(data, success, error) {
	generate_insert_sql(this.table, data, function(sql, values) {
		execute_query(sql, values, success, error);
	});
};

Model.prototype.truncate = function(agency_id, success, error) {
	execute_query('DELETE FROM ' + this.table + ' WHERE agency_id = $1;', [agency_id], success, error);
};

Model.prototype.import = function(agency_id, columns, file_path, success, error) {
	var self = this;
	self.truncate(agency_id, function() {
		var sql = 'COPY ' + self.table + ' (' + columns.join(', ') + ') FROM \'' + file_path + '\';';
		execute_query(sql, null, success, error);
	}, error);
};

module.exports = {
	Model: Model,
	create: function(table) {
		return new Model(table);
	}
};