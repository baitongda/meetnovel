var fs = require('fs'),
    path = require('path'),

    _ = require('underscore');

var root = path.resolve(__dirname, '../dist/'),
    global = path.resolve(root, 'g'),
    favicon = path.resolve(global, 'favicon.ico'),

    conf = {
        root: root,
        global: global,
        favicon: favicon,
        db: 'mongodb://meetnovel:meetnovel123@127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/meetnovel'
    };

/**
 * 初始化配置
 * @param  {object} options 配置选项，可配置项mode,可选值为[development, test, prod]
 * @return {null}
 */
function init(options) {
    // 根据不同的模式加载不同的配置
    var mode = options.mode;

    if (options.cpath) {
        var confData = require(options.cpath);
        conf = _.extend(conf, confData);

    }

    // 将配置项 export 出去
    update(conf);
}

/**
 * 更新配置项
 * @param  {object} data 配置参数字典
 * @return {[type]}      [description]
 */
function update(data) {
    _.each(data, function (value, key) {
        exports[key] = value;
    });
}

exports.init = init;
exports.update = update;
