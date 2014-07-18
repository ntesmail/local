module.exports = function(grunt) {
    grunt.registerTask('localserver', 'run local server', function(target) {
        var self = this;
        var options = self.options({});
        self.async();

        require('./lib/server').run(options.configFile, options.port, function() {
            grunt.event.emit('serverListening');
        });
    });
};