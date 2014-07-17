function mapping(config, fullPath, fullQuery) {
    var clonedConfig = JSON.parse(JSON.stringify(config));
    if (clonedConfig.Entries != null) {
        for (var i = 0; i < clonedConfig.Entries.length; i++) {
            var entry = clonedConfig.Entries[i];
            var pattern = new RegExp(entry.HttpUrl);
            var matcher = pattern.exec(fullPath);

            var matcher2 = null;
            // 是否匹配
            if (matcher && matcher.length > 0) {
                // 检查是否query参数匹配
                if (typeof entry.MatchQuery === 'string' && entry.MatchQuery != '') {
                    var mqStr = ".*" + entry.MatchQuery + ".*";
                    var pattern2 = new RegExp(mqStr);
                    matcher2 = pattern2.exec(fullQuery);
                    if (!(matcher2 && matcher2.length > 0)) {
                        console(fullQuery + " not matched: " + mqStr);
                        return null;
                    }
                }
                // 匹配到
                var map = {};
                map.BaseConfig = clonedConfig;

                entry.SourceRoot = format(entry.SourceRoot, matcher, matcher2);
                entry.OutputFileName = format(entry.OutputFileName, matcher, matcher2);
                entry.FtlFileName = format(entry.FtlFileName, matcher, matcher2);
                entry.Data = format(entry.Data, matcher, matcher2);
                entry.OutputRoot = format(entry.OutputRoot, matcher, matcher2);
                entry.HttpUrlRoot = format(entry.HttpUrlRoot, matcher, matcher2);

                map.Config = entry;
                return map;
            }
        }
    }

    return null;

}

// 替换起来
function format(content, matcher, matcher2) {
    if (content == null) {
        return content;
    }
    if (matcher && matcher.length > 0) {
        for (var i = matcher.length; i > 0; i--) {
            content = content.replace("{" + i + "}", matcher[i]);
        }
    }
    if (matcher2 && matcher2.length > 0) {
        for (var i = matcher2.length; i > 0; i--) {
            content = content.replace("{Q" + i + "}", matcher2[i]);
        }
    }
    return content;
}

/*
function test() {
    var fs = require('fs');
    var configFile = 'E:/git/local/src/test/mock/project_config.cfg';
    fs.readFile(configFile, function(err, data){
        var config = JSON.parse(data);
        var fullPath = 'http://l.mail.163.com/demo/main.jsp';
        var fullQuery = null;
        var map = mapping(config, fullPath, fullQuery);

        console.log(map);

        var fullPath = 'http://l.mail.163.com/demo/test1.jsp';
        var fullQuery = null;
        var map = mapping(config, fullPath, fullQuery);

        console.log(map);

        console.log(config)
    });    
}
*/

module.exports = mapping;
// module.exports.test =  test;