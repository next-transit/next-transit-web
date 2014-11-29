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
					'<%=dirs.css_build %>/core.css': ['<%=dirs.sass_src %>/core.scss'],
					'<%=dirs.css_build %>/views.css': ['<%=dirs.sass_src %>/views.scss'],
					'<%=dirs.css_build %>/agencies/septa.css': ['<%=dirs.sass_src %>/agencies/septa.scss'],
					'<%=dirs.css_build %>/agencies/trimet.css': ['<%=dirs.sass_src %>/agencies/trimet.scss']
				}
			}
		},
		concat: {
			options: {
				stripBanners: true
			},
			css: {
				src: [
					'<%= dirs.css_src %>/vendor/font-awesome.min.css',
					'<%= dirs.css_src %>/normalize.css',
					'<%= dirs.css_build %>/*.css'
				],
				dest: '<%= dirs.build %>/app.css'
			},
			js: {
				src: [
					'<%= dirs.js_src %>/core/core.js',
					'<%= dirs.js_src %>/core/*.js',
					'<%= dirs.js_src %>/services/resize.js',
					'<%= dirs.js_src %>/services/*.js',
					'<%= dirs.js_src %>/controllers/*.js'
				],
				dest: '<%= dirs.build %>/app.js'
			},
			jquery: {
				src: ['<%= dirs.js_src %>/vendor/jquery-2.0.3.min.js'], dest: '<%= dirs.dest %>/jquery-2.0.3.min.js'
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
					'<%= dirs.dest %>/app.min.css': ['<%= dirs.build %>/app.css'],
					'<%= dirs.dest %>/septa.min.css': ['<%= dirs.css_build %>/agencies/septa.css'],
					'<%= dirs.dest %>/trimet.min.css': ['<%= dirs.css_build %>/agencies/trimet.css']
				}
			}
		},
		uglify: {
			options: {
				banner: ''
			},
			app: {
				files: {
					'<%= dirs.dest %>/app.min.js': [
						'<%= dirs.js_src %>/vendor/jquery.scrollTo-1.4.3.1.js',
						'<%= dirs.build %>/app.js'
					]
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

		pkgRaw = JSON.stringify(pkg, null, '  ');

		grunt.file.write(pkgPath, pkgRaw);

		grunt.log.ok('Version set to ' + version);
	});
};