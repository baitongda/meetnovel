
var resProcessor = require('../components/res-processor/res-processor'),
    pageQuery = require('../components/page-query'),
    mongoose = require('mongoose');


const Book = mongoose.model('Book');
const Chapter = mongoose.model('Chapter');


/**
 * 书籍列表
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var bookList = (req, res, next) => {
    var page = req.body.page || 1;
    var Book = mongoose.model('Book');
    pageQuery(page, 30, Book, '', {}, {
        create_time: 'desc'
    }, function(error, $page){
        if(error){
            next(error);
        }else{
            resProcessor.jsonp(req, res, {
                records: $page.results,
                pageCount: $page.pageCount
            })
        }
    });
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
    // 书籍列表
    ['POST', '/api/book/list', bookList]
];
