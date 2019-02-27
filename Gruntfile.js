var path = require("path"),
	webpack = require("webpack"),
        sass = require('node-sass');
	
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		autoprefixer: {
			build: {
				expand: true,
				cwd: "build",
				src: ["**/*.css"],
				dest: "build"
			}
		},
		clean: {
			build: {
				src: ["build"]
			},
			stylesheets: {
				src: ["build/**/*.css", "!build/application.css", "build/css"]
			},
			scripts: {
				src: ["build/**/*.js", "!build/application.js", "build/js"]
			},
			sourcemaps: {
				src: ["build/application.js.map"]
			},
			phantom: {
				src: ["phantom/build/**"]
			},
			phantom_multiplayer: {
				src: ["phantom_multiplayer/build/**"]
			}
		},
		connect: {
			dev: {
				options: {
					port: 8000,
					base: "build",
					hostname: "*",
					keepalive: false
				}
			},
			webserver: {
				options: {
					port: 8000,
					base: "build",
					hostname: "*",
					keepalive: true
				}
			},
			phantom: {
				options: {
					port: 8800,
					base: ".",
					hostname: "127.0.0.1",
					keepalive: false
				}
			},
			serve_phantom: {
				options: {
					port: 8800,
					base: ".",
					hostname: "127.0.0.1",
					keepalive: true
				}
			}
		},
		copy: {
			build: {
				cwd: "src",
				src: ["**",
					"!**/*.scss",
					"!**/*.js",
					"!sass",
					"!js",
					"!css",
					"!**/components/**",
					"!index.html"],
				dest: "build",
				expand: true
			},
			phantom: {
				cwd: "build",
				src: ["**",
					"!index.html"],
				dest: "phantom/build",
				expand: true
			},
			phantom_multiplayer_dep: {
				cwd: "phantom",
				src: ["jquery.simulate.js",
					"misc.js"],
				dest: "phantom_multiplayer",
				expand: true
			},
			phantom_multiplayer: {
				cwd: "build",
				src: ["**",
					"!index.html"],
				dest: "phantom_multiplayer/build",
				expand: true
			}
		},
		cssmin: {
			build: {
				files: {
					"build/application.css": ["build/application.css"]
				}
			}
		},
		jshint: {
			js: ["src/js/*.js"],
			options: {
				globals: {
					require: false,
					module: true,
					console: false,
					window: true, 
					$: false
				},
				node: true,
				strict: false,
				undef: true,
				unused: true,
				loopfunc: true
			}
		},
		mochacov: {
			coverage: {
				options: {
					"check-leaks": true,
					"clearRequireCache": false,
					//"debug": true,
					"output": "test/results.html",
					"quiet": false,
					"reporter": "html-cov",
					"require": ["test/common"],
					"files": "test/*.js"
				}
			},
			/*options: {
				"files": "test/*.js"
			},*/
			passing: {
				options: {
					"check-leaks": true,
					"clearRequireCache": false,
					"quiet": false,
					"reporter": "spec",
					"require": ["test/common"],
					"files": "test/*.js"
				}
			},
			server: {
				options: {
					"timeout": 5000,
					"check-leaks": true,
					"clearRequireCache": false,
					"quiet": false,
					"reporter": "spec",
					"files": "../xokei-server/test/tests/*.js"
				}
			},
			server_phantom: {
				options: {
					"timeout": 5000,
					"check-leaks": true,
					"clearRequireCache": false,
					"quiet": false,
					"reporter": "spec",
					"files": "../xokei-server/test/tests_phantom/*.js"
				}
			}
		},
		sass: {
			options: {
			    implementation: sass,
			    sourceMap: false
			},
			dist: {
				files: {
					"build/application.css" : "src/sass/application.scss"
				}
			}
		},
		uglify: {
			build: {
				options: {
					mangle: false,
					sourceMap: true,
					sourceMapIn: "build/application.js.map",
					sourceMapName: "build/application.js.map"
				},
				files: {
					"build/application.js": ["build/application.js"]
				}
			}
		},
		watch: {
			options: {
				livereload: false,
				spawn: false
			},
			stylesheets: {
				files: "src/**/*.scss",
				tasks: ["stylesheets"]
			},
			scripts: {
				files: "src/**/*.js",
				tasks: ["scripts"]
			},
			// i didn't understood what this used for and looks like it does nothing
			// "scripts" watch will pick this files and run "build" which will run "copy" task
			// so we don't need this watcher
			//copy: {
			//	files: ["src/**",
			//			"src/*",
			//			"!src/**/*.scss",
			//			"!src/**/*.js",
			//			"!src/**/*"],
			//	tasks: ["copy"]
			//},
			html: {
				files: ["src/index.html"],
				tasks: ["copy:build", "htmlbuild"]
			},
			test: {
				files: ["test/*.js"],
				tasks: ["build"]
			},
			phantom: {
				files: ["phantom/test.*.js", "build/application.js", "build/index.html"],
				tasks: ["test_phantom"]
			},
			phantom_multiplayer: {
				files: ["phantom_multiplayer/test.*.js", "build/application.js", "build/index.html"],
				tasks: ["test_phantom_multiplayer"]
			}
		},
		webpack: {
			build: {
				mode: "development",
				devtool: "sourcemap",
				entry: "./src/js/main.js",
				output: {
					//path: "build/",
					path: path.join(__dirname, "build"),
					filename: "application.js"
				},
				/*plugins: [ // TODO: Enable this. Disabple during npm upgrade
					new webpack.ResolverPlugin(
						new webpack.ResolverPlugin
							.DirectoryDescriptionFilePlugin("bower.json", 
								["main"]
							)	
					)
				],*/

				resolve: {
					// root: [path.join(__dirname, "src", "components")] // removed during webpack upgrade
					modules: [path.join(__dirname, "src", "components"), 'node_modules'], // added during webpack upgrade ( https://stackoverflow.com/questions/43107233/configuration-resolve-has-an-unknown-property-root )
					// modules: ['node_modules'],
//descriptionFiles: ["package.json", "bower.json"]
				}
			}
		},
		/*mocha_phantomjs: {
			all: ['phantom/build/*.html']
		},*/

		mocha_phantomjs: {
			phantom: {
				files: {
					src: ['phantom/build/*.html']
				}
			},
			phantom_multiplayer: {
				files: {
					src: ['phantom_multiplayer/build/*.html']
				}
			}
		},
		htmlbuild: {
			build: {
				src: 'src/index.html',
				dest: 'build/',
				options: {
					data: {
						testfile: ''
					}
				}
			},
			phantom01: {
				src: 'src/index.html',
				dest: 'phantom/build/test.01.playFullGame.html',
				options: {
					data: {
						testfile: '<script src="../test.01.playFullGame.js" type="text/javascript" charset="utf-8"></script>'
					}
				}
			},
			phantom02: {
				src: 'src/index.html',
				dest: 'phantom/build/test.02.anotherGame.html',
				options: {
					data: {
						testfile: '<script src="../test.02.anotherGame.js" type="text/javascript" charset="utf-8"></script>'
					}
				}
			},
			phantom03: {
				src: 'src/index.html',
				dest: 'phantom/build/test.03.localResign.html',
				options: {
					data: {
						testfile: '<script src="../test.03.localResign.js" type="text/javascript" charset="utf-8"></script>'
					}
				}
			},
			phantom_multiplayer01: {
				src: 'src/index.html',
				dest: 'phantom_multiplayer/build/test.01.multiplayer.html',
				options: {
					data: {
						testfile: (process.env.DEBUG_TEST==true ? '<script>window.env_DEBUG_TEST=true;</script>' :'') + '<script src="../test.01.multiplayer.js" type="text/javascript" charset="utf-8"></script>'
					}
				}
			}
		},
		concurrent: {
			options: {
				logConcurrentOutput: true,
				limit: 4
			},
			dev: {
				tasks: [
					"watch:stylesheets",
					"watch:scripts",
					"watch:html",
					"watch:test"
				]
			},
			phantom_multiplayer: {
				tasks: [
					"mochacov:server_phantom",
					"mocha_phantomjs:phantom_multiplayer"
				]
			}
		},
		wait: {
			phantom: {
				options: {
					delay: 5000
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-jshint");	
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-mocha-cov");
	grunt.loadNpmTasks("grunt-sass");
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');
	grunt.loadNpmTasks('grunt-html-build');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-wait');

	grunt.registerTask(
		"welcome_message", function () {
			grunt.log.writeln('######################################################'.bold);
			grunt.log.writeln('Welcome to xokei'.bold);
			grunt.log.writeln('');
			grunt.log.writeln('Next commands are available for you:'['yellow']);
			grunt.log.writeln('Run ' + '`grunt release`'['green'] + ' to build source codes to ' + './build/'['magenta'] + ' folder that you can host on your server');
			grunt.log.writeln('Run ' + '`grunt webserver`'['green'] + ' to launch demo web server hosting ' + './build/'['magenta'] + ' folder');
			grunt.log.writeln('');
			grunt.log.writeln('Commands for developers:'['yellow']);
			grunt.log.writeln('Run ' + '`grunt dev`'['green'] + ' to build source codes, start web server and watch for file changes');
			grunt.log.writeln('Run ' + '`grunt phantom`'['green'] + '* in separate window to watch for changes and run phantom offline game tests');
			grunt.log.writeln('*only if you want to run tests to make sure your changes will not break anything');
			grunt.log.writeln('Tests:');
			grunt.log.writeln('Run ' + '`grunt test`'['green'] + ' to test client logic/functions/events');
			grunt.log.writeln('Run ' + '`grunt test_phantom`'['green'] + ' to play 2P offline game and check that everything works');
			grunt.log.writeln('Run ' + '`grunt test_server`'['green'] + '** to play 1P online game with emulated client trying to cheat and send malicious packets');
			grunt.log.writeln('Run ' + '`grunt test_phantom_multiplayer`'['green'] + '** to play 1P online game and check that everything works');
			grunt.log.writeln('**folder "xokei-server" must be located in same folder where "xokei-client" is');
			grunt.log.writeln('Check readme.md for more development-related test stuff');
			grunt.log.writeln('######################################################'.bold);
		});
	grunt.registerTask(
		"phantom_message", function () {
			grunt.log.writeln('You can look at tests in your browser at ' + 'http://127.0.0.1:8800/phantom/build'['magenta'] + ' if you want');
		});


	grunt.registerTask(
		"test",
		[
			"mochacov:passing",
			"mochacov:coverage"
		]);

	grunt.registerTask(
		"build_test_phantom",
		[
			"clean:phantom",
			"copy:phantom",
			"htmlbuild:phantom01",
			"htmlbuild:phantom02",
			"htmlbuild:phantom03"
		]);

	grunt.registerTask(
		"test_phantom",
		[
			"build_test_phantom",
			"mocha_phantomjs:phantom",
		]);

	grunt.registerTask(
		"test_phantom_multiplayer",
		[
			"clean:phantom_multiplayer",
			"copy:phantom_multiplayer_dep",
			"copy:phantom_multiplayer",
			"htmlbuild:phantom_multiplayer01",
			"concurrent:phantom_multiplayer"
		]);
	
	grunt.registerTask(
		"stylesheets",
		[
			"sass",
			"autoprefixer",
			"cssmin"
		]);
	
	grunt.registerTask(
		"scripts",
		[
			"jshint",
			"test",
			"webpack",
			"uglify",
			"clean:scripts"
			//"phantom"
		]);
	
	grunt.registerTask(
		"build",
		[
			"clean:build",
			"copy:build",
			"htmlbuild:build",
			"stylesheets",
			"scripts"
		]);

	grunt.registerTask(
		"default",
		[
			"welcome_message"
			//"build",
			//"connect",
			//"watch"
		]);

	/////////////////////////////////////

	grunt.registerTask(
		"release",
		[
			"build",
			"clean:sourcemaps"
		]);

	grunt.registerTask(
		"webserver",
		[
			"connect:webserver"
		]);

	grunt.registerTask(
		"dev",
		[
			"build",
			"connect:dev",
			"concurrent:dev"
		]);

	grunt.registerTask(
		"phantom",
		[
			"test_phantom",
			"connect:phantom",
			"phantom_message",
			"watch:phantom"
		]);

	grunt.registerTask(
		"serve_phantom",
		[
			"build_test_phantom",
			"connect:serve_phantom"
		]);

	grunt.registerTask(
		"test_server",
		[
			"mochacov:server"
		]);
};
