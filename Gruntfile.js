var pkg = require('./package.json');

module.exports = function (grunt) {
  grunt.initConfig({
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

    grunt.loadNpmTasks("grunt-browserify");
    grunt.registerTask('build', ['browserify:lib']);
};