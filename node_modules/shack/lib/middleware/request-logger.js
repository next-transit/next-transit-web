module.exports = function() {
	return function(req, res, next) {
		console.log(req.method.toUpperCase().info, req.path.info, '200'.success);
	};
};
