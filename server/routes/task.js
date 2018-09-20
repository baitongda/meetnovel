var biqugeTask = require('../task/biquge');

async function biquegeBookInit(req, res, next) {

    if (!req.body.bookId) {
        res.status(403).send('forbidon');
        return;
    }
    
    // biqugeTask.initBook('746');
    biqugeTask.initBook(req.body.bookId);
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

    
    ['POST', '/api/task/biquge/book/init', biquegeBookInit],
];
