function Sequential () {
	var self = this,
		fns = [],
		vals = [];

	function process(idx, resolve, reject) {
		if(fns.length > idx) {
			fns[idx](function(val) {
				vals.push(val);
				process(idx + 1, resolve, reject);
			}, reject);
		} else {
			resolve();
		}
	}

	self.add = function(to_execute) {
		fns.push(to_execute);
		return self;
	};

	self.then = function(on_resolve, on_reject) {
		process(0, function() {
			if(typeof on_resolve === 'function') {
				on_resolve.apply(self, vals);
			}
		}, on_reject);
	};
}

module.exports = function() {
	return new Sequential();
};