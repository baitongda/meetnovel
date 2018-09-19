var phantom = require('phantom');

const async = require('async');
const mongoose = require('mongoose');
const Book = mongoose.model('Book');
const Chapter = mongoose.model('Chapter');


phantom.cookiesEnabled = true;

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

/**
 * 抓取书籍所有文章列表
 * Url: 'https://www.qu.la/book/${bookId}'
 * @param {*} novelUrl 
 */
module.exports.fetchBookData =  async (bookId) => {
    var instance = null;

    try {
        instance = await phantom.create(['--ignore-ssl-errors=yes']);
        let page = await instance.createPage();

        page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36');
        page.setting('javascriptEnabled', true);
        await page.on('onResourceRequested',function(requestData) {
            console.info('Requesting',requestData.url);
        });
        let status = await page.open(`https://www.qu.la/book/${bookId}/`);
        let chapterList = [];
        let bookName = '';
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

            bookName = await page.evaluate(function() {
                return $('#info h1').html();
            })

            // console.log('chapterList:', chapterList);
        }
        instance.exit();
        return {
            chapterList,
            bookName,
        }
        

    } catch(error) {
        console.error('page error:', error);
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
        instance = await phantom.create(['--ignore-ssl-errors=yes']);
        let page = await instance.createPage();

        page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36');
        page.setting('javascriptEnabled', true);
        await page.on('onResourceRequested',function(requestData) {
            console.info('Requesting',requestData.url);
        });
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
            if (result.title && result.content) {
                chapter = {
                    id: chapterInfo.id,
                    bookId: chapterInfo.bookId,
                    name: result.title,
                    content: puer(result.content),
                }
            }
            // console.log('chapter:', chapter);
        }
        instance.exit();
        return chapter;
        

    } catch(error) {
        console.error('page error:', error);
        instance && instance.exit();
        client = null;
        return;
    };
}

module.exports.initBook = async (bookId) => {
    let {chapterList, bookName} = await module.exports.fetchBookData(bookId);

    // 创建书籍
    try {
        await Book.add({
            name: bookName,
            id: bookId,
        });
    } catch (err) {
        console.error(`add book[name=${bookName}] error:`, err);
        return;
    }

    // 爬取并保存章节
    let count = 0;
    async.mapLimit(chapterList, 5, async function (item, callback) {
        try {
            let chapter = await module.exports.fetchChapterContent(item);
            await Chapter.add(chapter);
            count++;
            console.log(`[book=${bookName}] 抓取${item.link}完成，已完成${count}章节，总章节数${chapterList.length}`);

            let delay = parseInt((Math.random() * 10000000) % 2000, 10);
            setTimeout(() => {
                callback && callback(null, item.link);
            }, delay);

        } catch (err) {
            console.error(`[book=${bookName}] 抓取${item.link}失败：`, err);
            callback && callback(err);
        }

    }, function (err, result) {
        console.log(`[book=${bookName}] 抓取完成! 抓取数量${count} 总章节数${result.length}`);
    });
}