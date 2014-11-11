module.exports = function(grunt) {
    grunt.registerTask('localserver', 'run local server', function(target) {
        var self = this;
        var options = self.options({});
        self.async();

        require('./lib/server').run(options.configFile, options.port, function() {
            grunt.event.emit('serverListening');
        });
    });
    grunt.registerTask('ftl2html', 'run generator', function(target) {
        var self = this;
        self.async();
        var options = self.options({});
        grunt.event.emit('ftl2html start');
        for(var i=0; i<options.fullPath.length; i++) {
	        require('./lib/server').ftl2html(options.configFile, options.fullPath[i]);
        }
    });
};