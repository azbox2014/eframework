const _ = require("lodash");

class BookInfo {
  constructor(params) {
    this.Title = _.get(params, "Title", "");
    this.Author = _.get(params, "Author", "");
    this.Introduce = _.get(params, "Introduce", "");
    this.ChapterUrl = null;
    this.Chapters$ = null;
  }
}

class ChapterItem {
  constructor(params) {
    this.Title = _.get(params, "Title", "");
    this.Index = _.get(params, "Index", 0);
    this.Url = _.get(params, "Url", "");
    this.Content$ = null;
  }
}

class ChapterContent {
  constructor(params) {
    this.Title = _.get(params, "Title", "");
    this.Index = _.get(params, "Index", 0);
    this.Url = _.get(params, "Url", "");
    this.Content = _.get(params, "Content", "");
  }
}

module.exports = {
  BookInfo,
  ChapterItem,
  ChapterContent
};