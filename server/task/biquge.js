var phantom = require('phantom');

const async = require('async');
const mongoose = require('mongoose');
const Book = mongoose.model('Book');
const Chapter = mongoose.model('Chapter');
const colors = require('colors');


phantom.cookiesEnabled = true;

var beginingInitBookMap = {};

/*
替换br和&nbsp标签
*/
function puer(str) {
	if (!str) {
		return
	}
	str = str.replace(/<br\s*\/?>/gi, "\r\n");
	str = str.replace(/&nbsp;/g, " ")
	return str
}

function uniq(arr, keyName) {
    let keyMap = {};
    return arr.filter(item => {
        let flag = false;
        if (!keyMap[item[keyName]]) {
            flag = true;
        }

        keyMap[item[keyName]] = true;

        return flag;
    })
}

/**
 * 抓取书籍所有文章列表
 * Url: 'https://www.qu.la/book/${bookId}'
 * @param {*} novelUrl 
 */
module.exports.fetchBookData =  async (bookId) => {
    var instance = null;

    try {
        instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no', '--disk-cache=true', '--max-disk-cache-size=1024000']);
        let page = await instance.createPage();

        page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36');
        page.setting('javascriptEnabled', true);
        await page.on('onResourceRequested',function(requestData) {
            // console.info('Requesting',requestData.url);
        });
        console.log(`biquge[bookId=${bookId}] `.magenta, `正在抓取书籍https://www.qu.la/book/${bookId}/`.cyan);
        let status = await page.open(`https://www.qu.la/book/${bookId}/`);
        let chapterList = [];
        let bookName = '';
        let bookImage = '';
        if(status === 'success'){
            chapterList = await page.evaluate(function() {
                return $('#list dl dd').map(function() {
                    var chapterUrlPath = ($(this).find('a').attr('href')).substring(($(this).find('a').attr('href')).lastIndexOf('/') + 1);
                    var chapterId = chapterUrlPath.substring(0, chapterUrlPath.indexOf('.'));
                    return ({
                        id: chapterId,
                        title: $(this).find('a').html(),
                        link: url + chapterUrlPath,
                    })
                }).toArray()
            });

            chapterList.map(item => {
                item.bookId = bookId
            });

            chapterList = uniq(chapterList, 'id');

            bookName = await page.evaluate(function() {
                return $('#info h1').html();
            })

            bookImage = await page.evaluate(function() {
                return window.location.origin + $('#sidebar #fmimg img').attr('src');
            })

            // console.log('chapterList:', chapterList);
        }
        instance.exit();
        return {
            chapterList,
            bookName,
            bookImage
        }
        

    } catch(error) {
        console.error(`biquge[bookId=${bookId}] `.magenta, `抓取书籍失败。err:`, error);
        instance && instance.exit();
        client = null;
        return {};
    };
}

/**
 * 根据抓取的章节数据抓取书籍章节内容
 * chapterInfo = {
 *  id: '10582911',
    link: 'https://www.qu.la/book/746/10582911.html',
    title: '第二篇 第二十四章 写信'
 * }
 * @param {*} novelUrl 
 */
module.exports.fetchChapterContent =  async (chapterInfo) => {
    var instance = null;

    try {
        instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no', '--disk-cache=true', '--max-disk-cache-size=1024000']);
        let page = await instance.createPage();

        page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36');
        page.setting('javascriptEnabled', true);
        await page.on('onResourceRequested',function(requestData) {
            // console.info('Requesting',requestData.url);
        });

        if (!chapterInfo.link && chapterInfo.id && chapterInfo.book_id) {
            chapterInfo.link = `https://www.qu.la/book/${chapterInfo.book_id}/${chapterInfo.id}.html`;
        }

        console.log(`biquge[bookId=${chapterInfo.bookId || chapterInfo.book_id}]`.magenta, `正在抓取章节${chapterInfo.link}/`.cyan)
        let status = await page.open(chapterInfo.link);
        var chapter;
        if(status === 'success'){
            var result = await page.evaluate(function() {
                //移除一些无关内容(等于直接在结果网页上的dom上进行操作)
                //请注意这里如果调用console.log()是无效的!
                $("#content a:last-child").remove()
                $("#content script:last-child").remove()
                $("#content div:last-child").remove()
                $("#content script:last-child").remove()
                return ({
                    title: $("h1").html(),
                    content: $("#content").html()
                });
            })
            if (result && result.title && result.content) {
                chapter = {
                    id: chapterInfo.id,
                    bookId: chapterInfo.bookId || chapterInfo.book_id,
                    name: result.title,
                    content: puer(result.content),
                }
            }
            // console.log('chapter:', chapter);
        }
        instance.exit();
        return chapter;
        

    } catch(error) {
        console.error('biquge page error:', error);
        instance && instance.exit();
        client = null;
        return;
    };
}

module.exports.initBook = async (bookId) => {
    beginingInitBookMap[bookId] = true;

    let {chapterList, bookName, bookImage} = await module.exports.fetchBookData(bookId);

    if (!bookName) {
        return;
    }
    
    // 创建书籍
    try {
        await Book.add({
            name: bookName,
            id: bookId,
            bookImage,
        });
    } catch (err) {
        
        // 如果是重复书籍则接着抓章节，否则为其它异常，结束抓取
        if (err.code === 11000) {
            console.log(`biquge[book=${bookName}]`.magenta, `书籍已抓取过，不重复保存`.gray);
        } else {
            console.error(`biquge[book=${bookName}] 保存书籍失败。 error:`, err);
            return;
        }
    }

    fetchChapterMpLimit(bookName, chapterList, true);
    
}

const fetchChapterMpLimit = async (bookName, chapterList, isBookInit) => {
    // 抓取并保存章节
    let count = 0;
    let bookId;
    async.mapLimit(chapterList, 5, async function (item, callback) {
        try {
            let dbExistChapter = await Chapter.findOne({id: item.id});

            if (dbExistChapter && dbExistChapter.id && !item.content) {
                console.log(`biquge[book=${bookName}]`.magenta, `章节${item.link}已抓取过，不重复保存`.gray);
                return;
            }

            let chapter = await module.exports.fetchChapterContent(item);

            if (!chapter || !chapter.id) {
                console.error(`biquge[book=${bookName}] 抓取章节${item.link}失败：获取dom失败`);
                return;
            }

            bookId = chapter.bookId;

            count++;
            
            // 新章节
            if (!item.content) {
                await Chapter.add(chapter);
                console.log(`biquge[book=${bookName}]`.magenta, `抓取${item.link}完成，已完成${count}章节，总章节数${chapterList.length}`.cyan);
            // 旧章节，则更新
            } else {
                dbExistChapter.content = chapter.content;
                await dbExistChapter.save();
                console.log(`biquge[book=${bookName}]`.magenta, `抓取${item.link}完成，该章节已更新内容！已完成${count}章节，总章节数${chapterList.length}`.cyan);
            }

            let delay = parseInt((Math.random() * 10000000) % 2000, 10);
            setTimeout(() => {
                callback && callback(null, item.link);
            }, delay);

        } catch (err) {
            // 如果是重复书籍则接着抓章节，否则为其它异常，结束抓取
            if (err.code === 11000) {
                console.log(`biquge[book=${bookName}]`.magenta, `章节${item.link}已抓取过，不重复保存`.gray);
            } else {
                console.error(`biquge[book=${bookName}] 抓取章节${item.link}失败：`, err, 'chapter:', chappter, 'item:', item);
                return;
            }
            
            callback && callback(err);
        }

    }, function (err, result) {
        if (isBookInit) {
            beginingInitBookMap[bookId] = false;
            doCheckTask();
        }
        if (err) {
            console.error(err);
        }
        console.log(`biquge[book=${bookName}]`.magenta, `抓取完成! 抓取数量${count} 总章节数${chapterList.length}`.cyan);
    });
}

var intervalIds = {};

module.exports.checkBookChapterUpdate = async (bookId) => {
    if (!beginingInitBookMap[bookId]) {
        let {chapterList, bookName, bookImage} = await module.exports.fetchBookData(bookId);

        let dbLastChapters = await Chapter.find({
            book_id: parseInt(bookId),
        }).sort({id: -1}).limit(3);

        let dbLastChapter;
        if (dbLastChapters && dbLastChapters.length) {
            dbLastChapter = dbLastChapters[0];
        }

        let extraFetchIds = [];
        dbLastChapters && dbLastChapters.map(item => extraFetchIds.push(item.id));
        

        let newChapters = chapterList && chapterList.filter(item => (parseInt(item.id) > (dbLastChapter && dbLastChapter.id || 0))) || [];

        newChapters = newChapters.concat(dbLastChapters);

        if (!newChapters.length) {
            console.log(`biquge[book=${bookName}]`.magenta, `暂无章节更新！`.cyan );
            return;
        }

        console.log(`biquge[book=${bookName}]`.magenta, `即将更新章节数：${newChapters.length - dbLastChapters.length}`.green );
        fetchChapterMpLimit(bookName, newChapters);
    }

    // intervalIds[bookId] && clearInterval(intervalIds[bookId]);
    // intervalIds[bookId] = setInterval(() => {
    //     module.exports.checkBookChapterUpdate(bookId);
    // }, 10 * 60 * 1000);
}

const doCheckTask = async () => {
    let books = await Book.find({});

    for (var i = 0, len = books.length; i < 1; i++) {
        (function(bookId) {
            intervalIds[bookId] && clearInterval(intervalIds[bookId]);
            intervalIds[bookId] = setInterval(() => {
                module.exports.checkBookChapterUpdate(bookId);
            }, (i + 5) * 60 * 1000 * (i + 1));
            // }, 3000);
        })(books[i].id);
    }
}

doCheckTask();
