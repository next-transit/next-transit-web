nextsepta.module('nextsepta').service('content_settings', ['module', function(module) {
	function parse_settings(content, callback) {
		var settings = {
				title: '',
				back: true,
				options: true,
				footer: true,
				map: false,
				map_locate: false,
				map_vehicle: null,
				route_type: null,
				route_id: null
			},
			comment_matches = content.match(/<!-- (.+) -->/i),
			matches = content.match(/<!-- (title: ([\w\|\- ]+));? ?(back: ?([\w]+))?;? ?(options: ?([\w]+))?;? ?(footer: ?([\w]+))?;? -->/i);

		if(comment_matches) {
			var settings_matches = comment_matches[1].match(/((\w)+: ?([^;]+))/ig);
			
			if(settings_matches) {
				settings_matches.forEach(function(setting_match) {
					var setting_parts = setting_match.split(/: ?/);
					if(setting_parts.length === 2) {
						var setting_name = setting_parts[0],
							setting_value = setting_parts[1];

						if(setting_value === 'true' || setting_value === 'false') {
							setting_value = setting_value === 'true';
						}

						if(setting_name in settings) {
							settings[setting_name] = setting_value;
						}
					}
				});
			}
		}

		if(typeof callback === 'function') {
			callback(settings);
		}

		module.emit('content-settings-changed', [settings]);
	}

	return { parse:parse_settings };
}]);