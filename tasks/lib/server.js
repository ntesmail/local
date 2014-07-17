var spawn = require('child_process').spawn;

var http = require('http');
var url = require('url');
var fs = require('fs');
var mapping = require('./mapping');

var cmd;

// run
function run(configFile, port) {

    // exe(["/c", "java","-jar","./jar/local-node-1.0.0.jar", 
    // './src/test/mock/project_config.cfg', 'http://l.mail.163.com/demo/test1.jsp']);

    // java -jar ./jar/local-1.0.0.jar ./demo/src/test/mock/project_config.cfg 8081
    if(typeof configFile !== 'string') {
        console.error('config file should be existed');
        return;
    }
    if(typeof port !== 'number') {
        console.error('port should be given');
        return;
    }
    // var cmd = 'java -jar ../deploy/local-1.0.0.jar ' + configFile + ' ' + port;

    // if(typeof cmd !== 'undefined') {
    //     console.error('already started');
    //     return;
    // }
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
                    var options = ["/c", "java", "-jar", "./jar/local-node-1.0.0.jar", configFile, fullPath, fullQuery];
                    exe(options, function() {
                        response(outputFile, map, res);
                    });
                } else {
                    response(outputFile, map, res);
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
            console.log('server started.');
        });

    });
}

function response(outputFile, map, res) {
    fs.readFile(outputFile, function(err, data) {
        if (err) {
            console.error('cannot read: ' + outputFile);
            // throw err;
        }
        var head = map.Config.Headers;
        var headMap = {
            'Content-Type': 'text/plain'
        };
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
        res.writeHead(200, headMap);
        res.end(data);
        // console.log('response end');
    });
}



function exe(command, callback, error) {
    // windows下 
    cmd = spawn("cmd", command);
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
    run: run
};