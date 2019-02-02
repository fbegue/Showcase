//source
//https://stackoverflow.com/questions/22184185/browserify-by-grunt-js-watch
//https://www.npmjs.com/package/grunt-express-server


module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		express: {
			options: {
				port: 8888,
			},
			dev: {
				options: {
					script: 'app.js'
				}
			}
			// prod: {
			// 	options: {
			// 		script: 'path/to/prod/server.js',
			// 		node_env: 'production'
			// 	}
		},

		watch: {
			files: ['app.js','songkick.js','public/bundle.js',],
			//tasks: ['browserify']
			express: {
				files:  [ '**/*.js' ],
				tasks:  [ 'express:dev' ],
				options: {
					spawn: false
					// for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
				}
			}
		}

		//http://browserify.org/

		// browserify: {
		// 	dist: {
		// 		files: {
		// 			'app/app.bundle.js': ['app/app.js'],
		// 		}
		// 	}
		// }
	});
//'rebuild',

	grunt.registerTask('dev', ['express:dev', 'watch']);
	grunt.registerTask('server', [ 'express:dev', 'watch' ])
	grunt.loadNpmTasks('grunt-contrib-watch');
	//grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-express-server');
	//grunt.registerTask('default', ['express']);
	//grunt.loadNpmTasks('grunt-browserify');
};