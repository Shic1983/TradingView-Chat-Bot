module.exports = function(grunt) { 
	"use strict";

	var fileArr = { 
		core: ['src/*.js'],
		all: ['src/*.js', 'example/setup.js']
	}
	
	// Configuration Goes here
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: '\n/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
		          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
		          '* http://<%= pkg.homepage %>/\n' +
		          '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
		          '<%= pkg.author.name %>; Licensed MIT */\n\n',
		concat: { 
		    options: { banner: '<%= banner %>' },
			core:  { 
				files: { 'build/<%= pkg.name %>.js': fileArr.core } 
			},
			example: { 
				files: { 'example/run.js': ['build/TVBot.js','example/setup.js'] }	
			}
		},
		uglify: {
			options: { banner: '<%= banner %>' },
			core: {
				files: { 
					'build/<%= pkg.name %>.min.js': ['build/<%= pkg.name %>.js'],
				}
			}
		},
		watch: {
			options: {
				interrupt: true,
				reload: true,
				livereload: 1337
			},
			all: { 
				files: fileArr.all,
				tasks: ['concat:core', 'concat:example', 'uglify:core'],
			},
		}

	});

	// Load plugins here
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-newer');

	
	grunt.registerTask('build', ['concat', 'uglify']);
	grunt.registerTask('default', ['concat', 'uglify', 'watch']);

};
