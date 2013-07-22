(function(global) {
	var nextsepta = global.nextsepta;

	nextsepta.__eval = function eval(module, selector) {
		var $elem = $(selector, module.$elem),
			$parent = $elem.parent();

		$('[ctrl]', $parent).each(function() {
			var $ctrl = $(this);
			if(!$ctrl.data('nextsepta-ctrl')) {
				var ctrlName = $ctrl.attr('ctrl'),
					ctrl = module.controller(ctrlName);

				if(ctrl) {
					$ctrl.data('nextsepta-ctrl', ctrl);

					var args = [];
					ctrl.dependencies.forEach(function(depName) {
						if(depName === '$elem') {
							args.push($ctrl);
						} else {
							args.push(module.dependency(depName));
						}
					});

					ctrl.constructor.apply(ctrl, args);
				}	
			}
		});
	};
})(window);