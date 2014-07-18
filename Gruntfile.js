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
  // load task localserver
  grunt.loadNpmTasks('grunt-localserver');
  // task
  grunt.registerTask('default', ['localserver']);
}