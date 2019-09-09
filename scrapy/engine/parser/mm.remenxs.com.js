/*
** 小说站：https://mm.remenxs.com/13844/
*/
const cheerio = require("cheerio");

const BaseParser = require("../BaseParser.js");

class Parser extends BaseParser {
  getBook(content) {
    let $ = cheerio.load(content);
    return {
      image: $("#read .main .detail img").attr("src"),
      title: $("#read .main .detail .name").text(),
      author: $("#read .main .detail .author a").text(),
      status: 1
    }
  }
  getCListNextUrl(content) {}
  getCList(content) {}
  getChapter(content) {}
}

module.exports = Parser;