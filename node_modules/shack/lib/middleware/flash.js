function _flash(type, msg) {
	if(!this.session) throw Error('shack flash requires a session.');
	var messages = this.session.messages = this.session.messages || {};
	if(type && msg) {
		messages[type] = messages[type] || [];
		messages[type].push(msg);
		return _flash;
	} else if(type) {
		if(messages[type]) {
			var type_msgs = messages[type];
			delete messages[type];
			return type_msgs;	
		}
		return [];
	} else {
		var msgs = [];
		for(var type in messages) {
			messages[type].forEach(function(message) {
				msgs.push({ type:type, message:message });
			});
		}
		this.session.messages = {};
		return msgs;
	}
}

module.exports = function flash () {
	return function(req, res, next) {
		if(req.flash) return next();
		req.flash = _flash;
		next();
	};
};
