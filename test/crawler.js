const _ = require("lodash");
const URL = require("url");
const Rx = require("rxjs");
const RxOp = require("rxjs/operators");
const JQuery = require("cheerio");
const Crawler = require("crawler");
const EventEmitter = require("events");



class BookCrawler extends EventEmitter {
  constructor(options) {
    super();
    let self = this;
    let defaultOptions = {
      rateLimit: 2000,
      maxConnections: 1,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
      entryUrl: "",
      onBooks: () => { },
      onBook: () => { },
      onChapters: () => { },
      onChapter: () => { }
    };
    self.crewler = new Crawler({

    });
    self.runner = new Rx.Subject();
    self.options = _.assign({}, defaultOptions, options);
  }

  start() {
    let self = this;
    self.runner.pipe(
      RxOp.mergeMap(res => {
        let { urls, nextOpt } = self.options.onBooks(res);
        nextOpt && self._fn_crawler_books(nextOpt);
        return Rx.from(urls);
      }),
      RxOp.mergeMap(url => self._fn_crawler_book(url))
    );
    self._fn_crawler_books(self.options.entryUrl);
  }

  _fn_crawler_books(url) {
    let self = this;
    self.crawler.queue({
      uri: url,
      callback: (err, res) => {
        if (err) self.runner.error(err);
        else if (res.statusCode == 200) self.runner.next(res);
        else self.runner.error(res);
      }
    });
  }

  _fn_crawler_book(url) {
     let self = this;
    let chapterSubject = new Rx.Subject();
    chapterSubject.pipe();
      self.crawler.queue({
        uri: url,
        llback: (err, res) => {
        if (err) chapterSubject.error(err);
          se if (res.statusCode == 200) {
            sync () => {
            let book = await self.options.onBook(res);
               (isSamePage) {
              let { chapters_url, nextOpt } = await self.options.onChapters(res);
              chapterSubject.next({ book, chapters_url });
              self._fn_crawler_chapters(chapterSubject, book, nextOpt);
              else {
              self._fn_crawler_chapters(chapterSubject, book, urls.chaptersUrl);
            }
          })();
          chapterSubject.next(res);
        }
        else chapterSubject.error(res);
      }
    });
  }

  _fn_crawler_chapters(subject, book, url) {
    //
  }

  _fn_crawler_chapter() { }
}

let crawler = new Crawler({
  rateLimit: 2000,
  maxConnections: 1,
  jQuery: false,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
});

const OpCrawlerBook = uri => {
  let book = {};
  Rx.Observable.create(observer => {
    crawler.queue({
      uri,
      callback: (err, res) => {
        if (err) observer.error(err);
        else if (res.statusCode == 200) observer.next(res);
        else observer.error(res);
        observer.complete();
      }
    });
  }).pipe(
    RxOp.map(res => {
      let $ = JQuery.load(res.body);
      book.title = $().text();
      book.author = $().text();
    })
  );
};

Rx.Observable.create(observer => {
  crawler.queue({
    uri: "http://mm.remenxs.com/type/",
    callback: (err, res) => {
      if (err) observer.error(err);
      else if (res.statusCode == 200) observer.next(res);
      else observer.error(res);
      observer.complete();
    }
  });
}).pipe(
  RxOp.mergeMap(res => {
    let $ = JQuery.load(res.body);
    return Rx.from($(".main .list li"));
  }),
  RxOp.map(el => {
    let $el = JQuery.load(el);
    return URL.resolve("http://mm.remenxs.com/type/", $el(".bookname a").attr("href"));
  }),
  RxOp.mergeMap(url => {
    //
  })
).subscribe(console.log, console.error);

