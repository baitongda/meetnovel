var _ = require('underscore'),
    // fs = require('fs'),
    path = require('path'),
    express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    // Multer = require('multer'),
    // session = require('session'),
    cookieParser = require('cookie-parser'),
    // passport = require('passport'),
    session = require('express-session'),
    cookieSession = require('cookie-session'),
    // mongoStore = require('connect-mongo')(session),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    // csrf = require('csurf'),
    lo = require('lodash'),

    conf = require('./conf'),
    db = require('./db'),
    pkg = require('../package.json'),

    api = require('./middleware/api/api'),
    dangerDetect = require('./middleware/danger-detect/danger-detect'),
    router = require('./middleware/router/router'),
    staticc = require('./middleware/static/static'),
    notFound = require('./middleware/not-found/not-found'),
    error = require('./middleware/error/error'),
    // Webpack_isomorphic_tools = require('webpack-isomorphic-tools'),

    routesPath = path.resolve(__dirname, './routes'),

    exphbs = require('express-handlebars'),

    app = express();

/**
 * 初始化服务（启用中间件）
 * @return {[type]} [description]
 */
function init() {
    var name = conf.name,
        version = conf.version,
        mode = conf.mode,
        root = conf.serverRoot,
        port = conf.serverPort;


    // 数据库初始化
    db.init();

    // require('./middleware/passport')(passport);

    // 配置常用变量
    app.set('name', name);
    app.set('version', version);
    app.set('mode', mode);

    app.enable('trust proxy');

    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', exphbs({
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
        defaultLayout: 'main',
    }));
    app.set('view engine', 'handlebars');

    // for parsing application/json
    app.use(bodyParser.json({
        limit: '10mb',
    }));

    // for parsing application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '10mb',
    }));

    // for parsing multipart/form-data file upload
    // app.use(new Multer().single('file'));

    // 日志打印

    /**
     * current date
     */

    logger.token('date', function getDateToken(req, res, format) {
        var date = new Date();

        switch (format || 'web') {
            case 'clf':
                return clfdate(date);
            case 'iso':
                return date.toISOString();
            case 'web':
                return date.toUTCString();
            case 'default':
                return date.toString();
        }
    });

    /**
     * 日志添加打印用户id
     * @param  {[type]} 'userId' [description]
     * @param  {[type]} function getUserIdToken(req, res [description]
     * @return {[type]}          [description]
     */
    // logger.token('userId', function getUserIdToken(req, res) {
    //     // return req.cookies && req.cookies.userId || (req.rSession && req.rSession.userId) || '';
    //     return lo.get(req, 'cookies.userId') || lo.get(req, 'rSession.user.userId') || '';
    // });

    app.use(logger(':remote-addr - :remote-user [:date[default]] ":method :url HTTP/:http-version" ":referrer" ":user-agent" :status :res[content-length] - :response-time ms'));

    // 危险检测
    app.use(dangerDetect());

    // 使用带签名的cookie，提高安全性
    app.use(cookieParser());
    app.use(cookieSession({ secret: 'secretsdfasfwpppPsO' }));

    // app.use(session({
    //     resave: false,
    //     saveUninitialized: true,
    //     secret: pkg.name,
    //     store: new mongoStore({
    //       url: conf.db,
    //       collection : 'sessions'
    //     })
    // }));

    // app.use(passport.initialize());
    // app.use(passport.session());

    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // should be declared after session and flash
    app.use(helpers(pkg.name));

    // app.use(csrf());
    // app.use(function (req, res, next) {
    //   res.csrf_token = req.csrfToken();
    //   // res.locals.csrf_token = res.csrf_token
    //   next();
    // });

    // 请求过滤器，识别请求类型存放于req.srcType中
    // app.use(requestFilter());

    // 启用API
    app.use(api());

    // 启用路由
    app.use(router(routesPath));

    // 启用静态文件
    app.use(staticc());

    // 页面不存在
    app.use(notFound());

    // 启用出错打印中间件
    app.use(error());

    // 配置监听端口
    var serverOptions = [
        port,
    ];

    // 配置监听host
    if (conf.host) {
        serverOptions.push(conf.host);
    }

    // 监听回调
    serverOptions.push(function () {
        console.log('[mode:', mode, '] listening on port ', port);
        process.on('SIGINT', function () {
            process.kill(process.pid);
        });
    });

    return app.listen(...serverOptions);
}

exports.app = app;
exports.init = init;
// exports.init = function () {
//     var context = require('../site/brand/webpack.config').context;
//     console.log(context);
//     // 配置webpack 前后端同构的tool
//     global.webpack_isomorphic_tools = new Webpack_isomorphic_tools(require('../site/brand/webpack_isomorphic_tools_config'))
//         .server(context, init);
// };
