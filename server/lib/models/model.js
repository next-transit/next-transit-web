var utils = require('./utils'),
	db = require('../db');

function Model(table) {
	this.CLASS = 'Model';
	this.table = table;
}

function generate_sql(table, select, joins, where, params, orders, limit, offset) {
	var sql = 'SELECT ' + (select || '*') + ' FROM ' + table;

	if(joins) {
		sql += ' ' + joins.trim() + ' ';
	}

	if(where) {
		sql += ' WHERE ' + where;
	}

	if(params) {
		var i = 0, len = params.length, idx, pg_var;
		for(; i < len; i++) {
			idx = sql.indexOf('?');
			if(idx === -1) {
				throw new Error('More expected values provided than params spots.');
			}

			pg_var = '$' + (i+1);

			sql = sql.substr(0, idx) + pg_var + sql.substr(idx+1);
		}
	}

	if(orders && typeof orders === 'string') {
		sql += ' ORDER BY ' + orders;
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

	var sql = generate_sql(this.table, select, joins, where, params, orders, limit, offset);

	db.query(sql, params, function(result) {
		if(typeof success === 'function') {
			success(result.rows);
		}
	}, error);
};

Model.prototype.process = function(data, callback) {
	callback(data);
};

Model.prototype.all = function(success, error) {
	this.where(null, success, error);
};

Model.prototype.where = function(where, params) {
	return Model.prototype.query.call(this).where(where, params);
};

Model.prototype.query = function() {
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

	query.done = function(callback) {
		model.select(q.select, q.joins, q.where, q.params, q.orders, q.limit, q.offset, callback, q.error);
	};

	query.first = function(callback) {
		model.select(q.select, q.joins, q.where, q.params, q.orders, 1, function(results) {
			if(results && results.length) {
				model.process(results[0], callback);
			} else {
				callback();
			}
		}, q.error);
	};

	return query;
};

module.exports = {
	Model: Model,
	create: function(table) {
		return new Model(table);
	}
};