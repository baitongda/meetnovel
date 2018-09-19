/**
 * 将参数字典解析成url参数
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function stringifyUrlParams(params) {
    let re = '';
    for (let key in params) {
        re += `${key}=${params[key]}&`;
    }

    return re;
}