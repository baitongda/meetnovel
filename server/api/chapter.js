
var resProcessor = require('../components/res-processor/res-processor'),
    pageQuery = require('../components/page-query'),
    mongoose = require('mongoose');


const Book = mongoose.model('Book');
const Chapter = mongoose.model('Chapter');

/**
 * 章节列表分页查询
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var chapterList = (req, res, next) => {
    var page = req.body.page || 1;
    var sortMode = req.body.sortMode || 'desc';
    var limit = req.body.limit || 30;
    var bookId = req.body.bookId;

    var Chapter = mongoose.model('Chapter');

    pageQuery(page, limit, Chapter, '-content', {
        book_id: bookId,
    }, {
        id: sortMode,
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
 * 章节详情查询
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var chapterInfo = async (req, res, next) => {
    try {
        let chapter = await Chapter.findOne({
            id: req.body.id,
        });

        resProcessor.jsonp(req, res, {
            record: chapter,
        })
    } catch(err) {
        next(error);
    }
}

var chapterNext = async (req, res, next) => {
    try {
        let chapter = await Chapter.find({
            id: { '$gt': req.body.id },
            book_id: req.body.bookId,
        }).sort({id: 1}).limit(1);

        resProcessor.jsonp(req, res, {
            record: chapter && chapter.length && chapter[0] || null,
        })
    } catch(err) {
        next(error);
    }
}


var chapterPrev = async (req, res, next) => {
    try {
        let chapter = await Chapter.find({
            id: { '$lt': req.body.id },
            book_id: req.body.bookId,
        }).sort({id: -1}).limit(1);

        resProcessor.jsonp(req, res, {
            record: chapter && chapter.length && chapter[0] || null,
        })
    } catch(err) {
        next(error);
    }
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
    // 章节列表分页查询
    ['POST', '/api/chapter/list', chapterList],
    // 章节详情查询
    ['POST', '/api/chapter/info', chapterInfo],

    // 获取下一章节
    ['POST', '/api/chapter/next', chapterNext],

    // 获取上一章节
    ['POST', '/api/chapter/prev', chapterPrev],
];
