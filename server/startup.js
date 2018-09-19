// require('babel-polyfill');

var fs = require('fs'),
    path = require('path'),
    os = require('os'),
    express = require('express'),
    commander = require('commander'),

    server = require('./server'),
    conf = require('./conf'),

    app = server.app,

    mode,
    host,
    port;

// 主函数入口
if (require.main === module) {
    // 配置命令行参数
    commander
        .option('-p, --port <number>', 'server port')
        .option('-h, --host <ip>', 'ipv4 address')
        .option('-m, --mode <dev|test|prod>', 'server mode')
        .parse(process.argv);

    console.log('start date : ',(new Date()).toString());
    console.log('...... detecting environment ......');
    console.log('   commander.host', commander.host);
    console.log('   commander.port', commander.port);
    console.log('   commander.mode', commander.mode);
    console.log('...... configuring ......');

    // 从命令行参数中读取，如果没有就默认设置为开发环境
    if (commander.mode) {
        mode = commander.mode;
    }
    // 尝试读取 UAE 环境变量
    if (!mode && process.env.NODE_MODE) {
        mode = process.env.NODE_MODE;
    }
    // 默认为开发模式
    if (!mode) {
        mode = 'dev';
    }
    console.log('   server mode', mode);

    // 初始化配置文件
    conf.init({
        mode: mode,
    });

    // 端口取用优先级
    // 从启动参数中获取
    if (commander.port) {
        try {
            port = Number(commander.port);
        } catch(e) {
            // logger.warn('commander.port parse error', e);
        }
    }

    // 指定运行ip地址
    if (commander.host) {
        if (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(commander.host)) {
            host = commander.host.trim();
        }
    }

    // 从环境变量中获取
    if (!port && process.env.PORT) {
        try {
            port = Number(process.env.PORT);
        } catch(e) {
            // logger.warn('process.env.PORT parse error', e);
        }
    }
    // 从配置文件获取
    if (!port && conf.serverPort) {
        port = conf.serverPort;
    }
    // 默认 5000
    if (!port) {
        port = 5005;
    }
    console.log('   server port', port);

    // 将参数放到配置中
    conf.update({
        mode: mode,
        host: host,
        serverPort: port,
    });

    // 编译jsx语法
    // if (conf.mode != 'prod') {
    //     require('babel-register')({
    //         // only: ['brand/**', 'wechat-react/**', 'wechat/**', 'test/**', 'middleware/**'],
    //         // ignore: function (filename) {
    //         //     console.log(filename);
    //         // },
    //         extensions: [ '.js' ]
    //     });
    // }

    // cluster模式多实例启动服务器
    // clusterStart();

    // 普通方式启动服务器
    server.init();
}
