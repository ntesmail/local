grunt-localserver
=====

A powerful local develop server for freemarker developer

Example:
```js
module.exports = function(grunt) {
    // load all tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // watch files
        watch: {
            compass: {
                files: ['src/main/webapp/style/scss/**/{,*/}*.{scss,sass}'],
                tasks: ['compass:server']
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: 'src/main/webapp/style/scss',
                cssDir: 'src/main/webapp/style/css',
                relativeAssets: false,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\nEncoding.default_external = "utf-8"\n'
            },
            server: {
                options: {
                    sourcemap: true
                }
            }
        },
        // localserver config
        localserver: {
            // multiple task
            dev: {
                options: {
                    // the config file
                    configFile: 'src/test/mock/project_config.cfg',
                    // the port
                    port: 8081,
                    // default is true for async, if used with [watch], it should be set to false
                    async: false
                }
            }
        },
        ftl2html: {
            test: {
                options: {
                    baseDir: '../../../',
                    sourceRoot: 'src/main/webapp/WEB-INF',
                    files: [{
                        ftl: '/tmpl/main.ftl',
                        tdd: 'src/test/mock/tdd/oglobal.tdd,src/test/mock/tdd/main.tdd'
                    }, {
                        ftl: '/tmpl/test1.ftl',
                        tdd: 'src/test/mock/tdd/oglobal.tdd,src/test/mock/tdd/test1.tdd'
                    }]
                }
            }
        }
    });

    grunt.registerTask('default', ['localserver:dev',  'watch']);

};

```