var pkg = require('./package.json');

module.exports = function (grunt) {
  grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: 'vendor',
                    cleanTargetDir: true,
                    cleanBowerDir: true                    
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
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks("grunt-browserify");
    grunt.registerTask('build', ['bower', 'browserify:lib']);
};