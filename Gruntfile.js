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
			}
		},
		connect: {
			server: {
				options: {
					port: 4000,
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
					  "!**/components/**"],
				dest: "build",
				expand: true
			}
		},
		cssmin: {
			build: {
				files: {
					"build/application.css": ["build/**/*.css"]
				}
			}
		},
		jshint: {
			myFiles: ["src/js/*.js"]
		},
		mochaTest: {
			test: {
				options: {
					report: "spec",
					captureFile: "test-results.txt",
					quiet: false,
					clearRequireCache: false
				},
				src: ["test/*.js"]
			}
		},
		sass: {
			dist: {
				files: {
					"build/css/style.css" : "src/sass/application.scss"
				}
			}
		},
		uglify: {
			build: {
				options: {
					mangle: false
				},
				files: {
					"build/application.js": ["build/application.js"]
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			stylesheets: {
				files: "src/**/*.scss",
				tasks: ["stylesheets"]
			},
			scripts: {
				files: "src/**/*.js",
				tasks: ["scripts"]
			},
			copy: {
				files: ["src/**",
						"src/*",
						"!src/**/*.scss",
						"!src/**/*.js",
						"!src/**/*"],
				tasks: ["copy"]
			}
		},
		webpack: {
			build: {
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
	grunt.loadNpmTasks("grunt-mocha-test");
	grunt.loadNpmTasks("grunt-sass");
	grunt.loadNpmTasks('grunt-webpack');
	
	grunt.registerTask(
		"stylesheets", 
		["sass",
		 "autoprefixer",
		 "cssmin",
		 "clean:stylesheets"]);
	
	grunt.registerTask(
		"scripts", 
		["jshint",
		 "mochaTest",
		 "webpack",
		 "uglify",
		 "clean:scripts"]);
	
	grunt.registerTask(
		"build", 
		["clean:build",
		 "copy",
		 "stylesheets",
		 "scripts"]);
	
	grunt.registerTask(
		"default", 
		["build",
		 "connect",
		 "watch"]);
}