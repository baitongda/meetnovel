
const md5 = require('md5');
const conf = require('../conf');

import { getStorageSync } from './storage';
import wepy from 'wepy';

/**
 * 生成n位随机数字串
 * @param  {Number} n 产生随机数的位数
 * @return {String}   产生的随机数
 */
const randomNum = (n) => {
    var res = '';
    for (var i = 0; i < n; i++) {
        res += Math.floor(Math.random() * 10);
    }

    return res;
};

/**
 * 组装参数
 * @param  {[type]} params [description]
 * @param  {[type]} secret [description]
 * @return {[type]}        [description]
 */
var wrapReqParams =  (params, secret) => {
    var timeStamp = (new Date()).getTime(),
        reqId = timeStamp + randomNum(3),
        reqSign = md5(reqId + ':' + secret + ':' + timeStamp),
        wrapedParams = {
            id: reqId,
            sign: reqSign,
            timestamp: timeStamp,
        };

    wrapedParams.data = params;

    return wrapedParams;
};


/**
 * 代理接口请求
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
export default (obj) => {
    obj.data = obj.data || {};

    // try {

    // 组装url
    if (obj.url.indexOf('http') != 0) {
        obj.url = conf.apiPrefix + (obj.url.indexOf('/') === 0 ? '' : '/') + obj.url;
    }

    // 所有请求带上sid
    // let sid = getStorageSync('sid');
    // if (sid) {
    //     obj.data.sid = sid;
    // }

    // 注入版本号标识给后端
    obj.data.clientVer = conf.clientVer;
    obj.data.caller = 'meetnovel';

    // 组装参数
    // let postData = wrapReqParams(obj.data, conf.apiKey);
    // obj.data = postData;

    // 固定请求为POST方式
    obj.method = 'POST';

    // } catch (e) {console.error(e);}

    return wepy.request(obj);
}
