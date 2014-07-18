grunt-localserver
=====

a powerful local develop server for freemarker developer

Example:
```js
module.exports = function (grunt) {
  // config demo
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    localserver: {
        options : {
            configFile : './src/test/mock/project_config.cfg',
            port : 8081
        }
      
    }
  });

  grunt.event.on('serverListening', function() {
        // server started
  });
  // load task localserver
  grunt.loadNpmTasks('grunt-localserver');
  // task
  grunt.registerTask('default', ['localserver']);

  // when started event "serverListening" would be return
}
```