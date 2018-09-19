
var path = require('path'),
    htmlProcessor = require('../components/html-processor/html-processor'),
    resProcessor = require('../components/res-processor/res-processor'),
    mongoose = require('mongoose');


const Book = mongoose.model('Book');
const Chapter = mongoose.model('Chapter');


/**
 * 添加书籍
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var addBook = (req, res, next) => {
    Book.add(req);
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
    // 新增书籍
    ['POST', '/api/book/add', addBook]
];
