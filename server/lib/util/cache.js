var _cache = {},
	cache = {};

cache.contains = function(key) {
	return (key in _cache);
};

cache.get = function(key) {
	return _cache[key];
};

cache.put = function(key, value) {
	_cache[key] = value;
	return cache;
};

module.exports = cache;