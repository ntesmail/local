var spawn = require('child_process').spawn;

var http = require('http');
var url = require('url');
var fs = require('fs');
var os = require('os');
var mapping = require('./mapping');
var pathUtil = require('path');
// run
function run(configFile, port, callback) {

    // exe(["/c", "java","-jar","./jar/local-node-1.0.0.jar", 
    // './src/test/mock/project_config.cfg', 'http://l.mail.163.com/demo/test1.jsp']);

    // java -jar ./jar/local-1.0.0.jar ./demo/src/test/mock/project_config.cfg 8081
    if (typeof configFile !== 'string') {
        console.error('config file should be existed');
        return;
    }
    if (typeof port !== 'number') {
        console.error('port should be given');
        return;
    }
    // var cmd = 'java -jar ../deploy/local-1.0.0.jar ' + configFile + ' ' + port;

    fs.readFile(configFile, function(err, data) {
        if (err) {
            console.error('cannot read: ' + configFile);
            throw err;
        }
        try {
            var config = JSON.parse(data);
        } catch (ex) {
            console.error('JSON parse failed: ' + data);
            throw ex;
        }

        var srv = http.createServer(function(req, res) {
            var host = req.headers.host;
            // the hostname
            var hostname = host.split(':')[0];

            var oUrl = url.parse(req.url);

            // /xxxx/test/xx
            var pathname = oUrl.pathname;
            // a=b&c=d
            var fullQuery = oUrl.query;

            var fullPath = 'http://' + hostname + pathname;
            // console.log('configFile:' + configFile);
            console.log('fullPath:' + fullPath);
            // console.log('fullQuery:' + fullQuery);
            var map = mapping(config, fullPath, fullQuery);
            // console.log('map: ' + map);
            if (map) {
                var outputFile;
                if (map.Config.OutputFileName && map.Config.OutputFileName.length > 0) {
                    outputFile = map.Config.OutputRoot + map.Config.OutputFileName;
                } else {
                    var path = fullPath.substring(map.Config.HttpUrlRoot.length);
                    outputFile = map.Config.OutputRoot + path;
                }
                console.log('outputFile:' + outputFile);
                if (map.Config.Script) {
                    // console.log('exec ftl');
                    var jarPath = pathUtil.join(__dirname, "../../jar/local-node-1.0.0.jar");

                    if (os.platform() === 'win32') {
                        // windows
                        var command = "cmd";
                        var options = ["/c", "java", "-jar", jarPath, configFile, fullPath, fullQuery];
                    } else {
                        // mac linux
                        var command = "java";
                        var options = ["-jar", jarPath, configFile, fullPath, fullQuery];
                    }
                    exe(command, options, function() {
                        response(outputFile, map, res, fullQuery);
                    });
                } else {
                    response(outputFile, map, res, fullQuery);
                }
            } else {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.end('no mapping');
            }

            //  require('./lib/server').run('./src/test/mock/project_config.cfg',8081)
            //  java -jar ./jar/local-node-1.0.0.jar ./src/test/mock/project_config.cfg http://l.mail.163.com/demo/test1.jsp
        });

        srv.listen(port, function() {
            console.log('server started at port: ' + port);
            callback();
        });


        // console.log('server started.');
    });
}

function ftl2html(configFile, fullPath) {
    // java -jar ./jar/local-1.0.0.jar ./demo/src/test/mock/project_config.cfg 8081
    if (typeof configFile !== 'string') {
        console.error('config file should be existed');
        return;
    }
    if (typeof fullPath !== 'string') {
        console.error('fullPath should be given');
        return;
    }

    // var cmd = 'java -jar ../deploy/local-1.0.0.jar ' + configFile + ' ' + port;
    fs.readFile(configFile, function(err, data) {
        if (err) {
            console.error('cannot read: ' + configFile);
            throw err;
        }
        try {
            var config = JSON.parse(data);
        } catch (ex) {
            console.error('JSON parse failed: ' + data);
            throw ex;
        }
        var fullQuery = '';
        // console.log('fullQuery:' + fullQuery);
        var map = mapping(config, fullPath, fullQuery);
        // console.log('map: ' + map);
        if (map) {
            var outputFile;
            if (map.Config.OutputFileName && map.Config.OutputFileName.length > 0) {
                outputFile = map.Config.OutputRoot + map.Config.OutputFileName;
            } else {
                var path = fullPath.substring(map.Config.HttpUrlRoot.length);
                outputFile = map.Config.OutputRoot + path;
            }
            console.log('outputFile:' + outputFile);
            if (map.Config.Script) {
                // console.log('exec ftl');
                var jarPath = pathUtil.join(__dirname, "../../jar/local-node-1.0.0.jar");

                if (os.platform() === 'win32') {
                    // windows
                    var command = "cmd";
                    var options = ["/c", "java", "-jar", jarPath, configFile, fullPath, fullQuery];
                } else {
                    // mac linux
                    var command = "java";
                    var options = ["-jar", jarPath, configFile, fullPath, fullQuery];
                }
                exe(command, options, function() {
                    console.log('html generated');
                });
            } else {
                console.log('ignore');
            }
        } else {
            console.error('no mapping : ' + fullPath);
        }
    });
}

function convertQuery(query) {
    var map = {};
    var qs = query.split("&");
    for (var i = 0; i < qs.length; i++) {
        var pair = qs[i].split("=");
        if (pair.length > 1) {
            map[pair[0]] = pair[1];
        }
    }
    return map;
}

function response(outputFile, map, res, fullQuery) {
    fs.readFile(outputFile, function(err, data) {
        if (err) {
            console.error('cannot read: ' + outputFile);
            // throw err;
        }
        var head = map.Config.Headers;
        var headMap = {};
        if (typeof head === 'string' && head.length > 0) {
            var headers = head.split("|");
            for (var i = 0; i < headers.length; i++) {
                var h = headers[i];
                var firstIndex = h.indexOf(':');
                if (firstIndex > 0 && firstIndex < h.length) {
                    var key = h.substring(0, firstIndex);
                    var val = h.substring(firstIndex + 1);
                    headMap[key] = val;
                }
            }
        }
        res.writeHead(200, headMap);

        // support query replacement
        if (map.Config.SupportQuery && typeof fullQuery === 'string') {
            if (typeof data !== 'undefined') {
                var qs = convertQuery(fullQuery);
                var content = data.toString('utf-8');
                for (var key in qs) {
                    content = content.replace(new RegExp("%" + key + "%", "g"), qs[key]);
                };

                res.end(content);
            } else {
                res.end(data);
            }
        } else {
            res.end(data);
        }
    });
}



function exe(command, options, callback, error) {
    var cmd = spawn(command, options);
    cmd.stdout.setEncoding("utf-8");
    cmd.stdout.on("data", function(data) {
        console.log(data);
    });

    cmd.stderr.on("data", function(data) {
        console.log("stderr: " + data);
    });

    cmd.on("exit", function(code) {
        // 正常结束
        callback();
        // console.log("------------------------------");
    });

    cmd.on('close', function(code, signal) {
        if (code != 0) {
            console.log('child process terminated due to receipt of signal ' + signal);
        }
    });
};

function stop() {
    // TODO 
}

module.exports = {
    run: run,
    ftl2html: ftl2html
};
