module.exports = function(grunt) {
    grunt.registerTask('localserver', 'run local server', function(target) {
        var self = this;

        var options = self.options({});

        require('./lib/server').run(options.configFile, options.port);
    });
};