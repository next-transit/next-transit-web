module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		dirs: {
			css_src: 'app/build/css',
			css_build: 'app/build/css',
			sass_src: 'app/sass'
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
					'<%=dirs.css_build %>/patterns.css': ['<%=dirs.sass_src %>/patterns.scss']
				}
			}
		},
		concat: {
			app: {
				files: {
					'<%=dirs.css_build %>/app.css': [
						'<%=dirs.css_src %>/normalize.css', 
						'<%=dris.css_build %>/core.css'
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
	grunt.loadNpmTasks('grunt-contrib-watch');
};