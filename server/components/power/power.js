var proxy = require('../proxy/proxy');
var conf = require('../../conf');

/**
 * 请求API获取权限
 *
 * @param {any} liveId
 * @param {any} topicId
 * @param {any} userId
 * @returns
 */
function getPowers (liveId, topicId, userId, secret) {
    var uri = conf.wechatApi.common.getPower;

    return new Promise(function (resolve, reject) {
        proxy.apiProxy(uri, {liveId: liveId, topicId: topicId, userId: userId}, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        }, secret);
    });
}

module.exports.getPowers = getPowers;
