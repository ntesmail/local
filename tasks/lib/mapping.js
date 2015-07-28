var pathUtil = require('path');
var fs = require('fs');

// 点号表示当前文件所在路径  
var baseRealPath = fs.realpathSync('.');

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
                        // console.log(fullQuery + " not matched: " + mqStr);
                        continue;
                    }
                }
                // 匹配到
                var map = {};
                map.BaseConfig = clonedConfig;

                entry.SourceRoot = pathUtil.join(baseRealPath, format(entry.SourceRoot, matcher, matcher2));
                entry.OutputFileName = format(entry.OutputFileName, matcher, matcher2);
                entry.FtlFileName = format(entry.FtlFileName, matcher, matcher2);
                entry.Data = format(entry.Data, matcher, matcher2);
                entry.OutputRoot = pathUtil.join(baseRealPath, format(entry.OutputRoot, matcher, matcher2));
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
        return '';
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


module.exports = mapping;
