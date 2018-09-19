/**
 * 将秒数转换为时间字符串
 * @param {Float} second 
 */
export function secondToTimeStr(second) {
    if (!second || second <= 0) { return '00:00' }
    second = Math.ceil(second)
    let min = (Math.floor(second / 60)).toString()
    while (min.length < 2) {
        min = '0' + min
    }
    let sec = (second % 60).toString()
    while (sec.length < 2) {
        sec = '0' + sec
    }
    return min + ':' + sec
}

/**
 * 根据时间戳显示多久前的字符串
 * @param  {[type]} pushTime [description]
 * @return {[type]}           [description]
 */
export const timeBefore = (pushTime, nowTime) => {

    var timeNow = parseInt(new Date().getTime()),
        d = ((nowTime || timeNow) - parseInt(pushTime)) / 1000,
        d_days = Math.floor(d / 86400),
        d_hours = Math.floor(d / 3600),
        d_minutes = Math.floor(d / 60);

    if (d_days > 30) {
        return formatDate(pushTime)
    } else if (d_days > 0 && d_days <= 30) {
        return d_days + "天前";
    } else if (d_days <= 0 && d_hours > 0) {
        return d_hours + "小时前";
    } else if (d_hours <= 0 && d_minutes > 0) {
        return d_minutes + "分钟前";
    } else {
        return '刚刚';
    }
}


/**
 * 格格式输出日期串
 * @param date      {Number/Date}   要格式化的日期
 * @param formatStr {String}        格式串(yMdHmsqS)
 * @returns {*|string}
 */
export function formatDate(date, formatStr) {
    if (!date) {
        return '';
    }

    var format = formatStr || 'yyyy-MM-dd';

    if ('number' === typeof date || 'string' === typeof date) {
        date = new Date(+date);
    }

    var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;

}