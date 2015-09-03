var pkg = require('./package.json');

module.exports = function (grunt) {
  grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: './vendor',
                    cleanTargetDir: true,
                    //cleanup: true,
                    install: true,
                    //layout: 'byType',
                    copy: false,
                    verbose: true
               }
            }
        },
        
        browserify: {
            lib: {
                src: pkg.main,
                dest: './dist/'+pkg.main,
                options: {
                    debug: true,
                    extensions: ['.js'],
                    transform: ["babelify"]
                }
            },
            example: {
                src: './example/mapExample.js',
                dest: './dist/mapExample.js',
                options: {
                    debug: true,
                    extensions: ['.js'],
                    transform: ["babelify"]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks("grunt-browserify");
    grunt.registerTask('build', ['browserify:lib']);
};