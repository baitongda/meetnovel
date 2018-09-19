var biqugeTask = require('../task/biquge');

async function biquegeBookInit(req, res, next) {
    
    // biqugeTask.initBook('746');
    biqugeTask.initBook(req.query.bookId);
    res.status(200).send('ok');
}

/**
 * routes配置，配置格式如下：
 * routes = [
 *     ['get', '/abc', fun1, [fun2, fun3, ...]],
 *     ['post', '/abcd', fun1, fun2],
 *     ...
 * ]
 */
module.exports = [

    
    ['GET', '/task/biquge/book/init', biquegeBookInit],
];
