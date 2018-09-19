var _ = require('underscore'),

    conf = require('../../conf'),
    server = require('../../server'),

    urlUtils = require('../url-utils/url-utils');

/**
 * 从redis获取微博相关配置信息
 * 例："{\"accessToken\":\"mv73GxENZ94FViXsKwGJPEP-PT5nCDOJgyMdmROkWiLUbIn4rEiexziGSThsimyMTpxWuUmvMT65iwXe0O8WBDay5tXhuaWx_oOG3Ozhn02D4F0isBz_Y7q8p3VG0hbZYBXdACAJMI\",\"appId\":\"wx6b010e5ae2edae95\",\"appsecret\":\"c21e72db8d46ea7f2d35910212241a00\",\"expiresIn\":7200,\"jsapiTicket\":\"sM4AOVdWfPE4DxkXGEs8VDBiTkMK_4q5Pam6Jf1M6kHxA25yb0_VO5aAkHlS-eoSlydE7ug1PtwLPloQ0emG-A\",\"rediectUri\":\"http%3A%2F%2Fm.qlchat.com%2Flogin.htm\",\"token\":\"live\"}"
 * @return {[type]}      [description]
 */
function getConfig (callback){

    server.app.redisCluster.get('_WT_WEIBO_ACCESS_TOKEN', function(err, config){
        if(err){
            config = {};
        } else {
            try {
                config = JSON.parse(config);
            } catch(error) {
                console.error('parse weibo config error:', error);
            }
            if (!config) {
                config = {};
            }
        }

        if ('function' === typeof callback) {
            callback(config);
        }
    });
}

/**
 * 获取页面的微博手动授权登录页完整地址
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-30T19:42:58+0800
 * @param    {[type]}                           pageUrl  [description]
 * @param    {Function}                         callback [description]
 * @return   {[type]}                                    [description]
 */
module.exports.getAuthLoginUrl = function(pageUrl) {
    return 'https://api.weibo.com/oauth2/authorize' +
            '?client_id=' + conf.weiboClientId +
            '&scope=direct_messages_write,follow_app_official_microblog' + 
            '&response_type=code' +
            '&redirect_uri=' + encodeURIComponent(urlUtils.fillParams({
                    client: 'weibo'
                }, pageUrl, ['code', 'state', 'loginType']));


    // getConfig(function(weiboConf) {
    //     var url = 'https://api.weibo.com/oauth2/authorize' +
    //         '?client_id=' + weiboConf.appId +
    //         '&response_type=code' +
    //         '&redirect_uri=' + encodeURIComponent(urlUtils.fillParams({
                    
    //             }, pageUrl, ['code', 'state', 'loginType']));

    //     if (callback) {
    //         callback(url);
    //     }
    // });
};

// module.exports.getConfig = getConfig;
