var path = require("path"),
	webpack = require("webpack");
	
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
			phantom: {
				src: ["phantom/build/**"]
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: "build",
					hostname: "*"
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
					"debug": true,
					"output": "test/results.html",
					"quiet": false,
					"reporter": "html-cov",
					"require": ["test/common"]
				}
			},
			options: {
				"files": "test/*.js"
			},
			passing: {
				options: {
					"check-leaks": true,
					"clearRequireCache": false,
					"quiet": false,
					"reporter": "spec",
					"require": ["test/common"]
				}
			}
		},
		sass: {
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
				livereload: true,
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
				tasks: ["copy:build"]
			},
			test: {
				files: ["test/*.js"],
				tasks: ["build"]
			}
		},
		webpack: {
			build: {
				devtool: "sourcemap",
				entry: "./src/js/main.js",
				output: {
					path: "build/",
					filename: "application.js"
				},
				plugins: [
					new webpack.ResolverPlugin(
						new webpack.ResolverPlugin
							.DirectoryDescriptionFilePlugin("bower.json", 
								["main"]
							)	
					)
				],
				resolve: {
					root: [path.join(__dirname, "src", "components")]
				}
			}
		},
		mocha_phantomjs: {
			all: ['phantom/build/index.html']
		},
		htmlbuild: {
			build: {
				src: 'src/index.html',
				dest: 'build/'
			},
			phantom: {
				src: 'src/index.html',
				dest: 'phantom/build/'
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

	grunt.registerTask(
		"test",
		[
			"mochacov:passing",
			"mochacov:coverage"
		]);

	grunt.registerTask(
		"phantom",
		[
			"clean:phantom",
			"copy:phantom",
			"htmlbuild:phantom",
			"mocha_phantomjs"
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
			"clean:scripts",
			"phantom"
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
			"build",
			"connect",
			"watch"
		]);
}