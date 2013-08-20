module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		dirs: {
			sass_src: 'app/sass',
			css_src: 'app/css',
			css_build: 'app/build/css',
			js_src: 'app/js',
			build: 'app/build',
			dest: 'app/dest'
		},
		sass: {
			app: {
				options: {
					style: 'expanded'
				},
				files: {
					'<%=dirs.css_build %>/typography.css': ['<%=dirs.sass_src %>/typography.scss'],
					'<%=dirs.css_build %>/core.css': ['<%=dirs.sass_src %>/core.scss'],
					'<%=dirs.css_build %>/buttons.css': ['<%=dirs.sass_src %>/buttons.scss'],
					'<%=dirs.css_build %>/forms.css': ['<%=dirs.sass_src %>/forms.scss'],
					'<%=dirs.css_build %>/components.css': ['<%=dirs.sass_src %>/components.scss'],

					'<%=dirs.css_build %>/layout.css': ['<%=dirs.sass_src %>/layout.scss'],
					'<%=dirs.css_build %>/map.css': ['<%=dirs.sass_src %>/map.scss'],
					'<%=dirs.css_build %>/home.css': ['<%=dirs.sass_src %>/home.scss'],
					'<%=dirs.css_build %>/stops.css': ['<%=dirs.sass_src %>/stops.scss'],
					'<%=dirs.css_build %>/trips.css': ['<%=dirs.sass_src %>/trips.scss'],
					'<%=dirs.css_build %>/options.css': ['<%=dirs.sass_src %>/options.scss'],
					'<%=dirs.css_build %>/feedback.css': ['<%=dirs.sass_src %>/feedback.scss'],
					'<%=dirs.css_build %>/patterns.css': ['<%=dirs.sass_src %>/patterns.scss']
				}
			}
		},
		concat: {
			css: {
				src: [
					'<%= dirs.css_src %>/vendor/font-awesome.min.css',
					'<%= dirs.css_src %>/normalize.css', 
					'<%= dirs.css_build %>/typography.css', 
					'<%= dirs.css_build %>/core.css', 
					'<%= dirs.css_build %>/*.css'
				],
				dest: '<%= dirs.build %>/app.css'
			},
			js: {
				src: [
					'<%= dirs.js_src %>/vendor/jquery.scrollTo-1.4.3.1.js',
					'<%= dirs.js_src %>/core/core.js',
					'<%= dirs.js_src %>/core/*.js',
					'<%= dirs.js_src %>/services/*.js',
					'<%= dirs.js_src %>/controllers/*.js'
				],
				dest: '<%= dirs.build %>/app.js'
			},
			jquery: {
				src: ['<%= dirs.js_src %>/vendor/jquery-1.9.1.min.js'], dest: '<%= dirs.dest %>/jquery-1.9.1.min.js'
			}
		},
		jshint: {
			app: ['<%= dirs.build %>/app.js']
		},
		cssmin: {
			options: {
				banner: ''
			},
			app: {
				files: {
					'<%= dirs.dest %>/app.min.css': ['<%= dirs.build %>/app.css']
				}
			}
		},
		uglify: {
			options: {
				banner: ''
			},
			app: {
				files: {
					'<%= dirs.dest %>/app.min.js': ['<%= dirs.build %>/app.js']
				}
			}
		},
		watch: {
			sass: {
				files: '<%=sass_src %>/*.scss',
				tasks: ['sass']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', 'Does full production build, including setting version if supplied.', function(version) {
		var tasks = ['sass', 'concat', 'jshint', 'cssmin', 'uglify'];
		if(version) {
			tasks.push('version:' + version);
		}
		grunt.task.run(tasks);
	});

	grunt.registerTask('version', 'Updates the official version number.', function(version) {
		var pkgPath = 'package.json',
			pkg,
			pkgRaw = '';

		pkg = grunt.file.readJSON(pkgPath);
		if(!pkg) {
			grunt.log.error('Couldn\'t read package file.');
			return;
		}

		if(!version) {
			grunt.log.writeln(pkg.version);
			return;
		}

		pkg.version = version;

		pkgRaw = JSON.stringify(pkg, null, '\t');

		grunt.file.write(pkgPath, pkgRaw);

		grunt.log.ok('Version set to ' + version);
	});
};