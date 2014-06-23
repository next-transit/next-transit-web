nextsepta.module('nextsepta').service('persist', ['module', 'history', function(module, history) {
	var storage = window.localStorage,
		storage_name = 'persist_state';

	// Safely returns a Object or undefined
	function get_state_obj() {
		var raw = storage[storage_name];
		if(raw) {
			try {
				return JSON.parse(raw);
			}
			catch(e) {}
		}
	}

	// Set state for current path
	function set_state(path) {
		var state_str = JSON.stringify({ path:path, ts:(new Date).getTime() });
		storage[storage_name] = state_str;
	}

	// In minutes
	function get_state_age(state) {
		var age = 1000;
		if(state && typeof state.ts === 'number') {
			var diff = (new Date).getTime() - state.ts;
			age = diff / 1000 / 60;
		}
		return age;
	}

	function load_peristed_state() {
		var state = get_state_obj(),
			age = get_state_age(state);

		// First page load (coming from Home bookmark)
		// and request is to the home page 
			// (if you bookmark a specific page it will always go there)
		// and we have a persisted state
		// and it's less than 30 mins old
		if(!window.history.state && window.location.pathname === '/' && state && age < 30) {
			history.push(state.path);
		}
	}

	function persist_changes() {
		module.on('history-push', function(evt, path) {
			set_state(path);
		});
	}

	function init() {
		// Only load from storage or track changes if this is a web-app
		if(window.navigator.standalone) {
			load_peristed_state();
			persist_changes();
		}
	}

	return init;
}]);
