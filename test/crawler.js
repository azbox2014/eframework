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
      RxOp.take(200),
      RxOp.mergeMap(url => self._fn_crawler_book(url))
    ).subscribe(console.log, console.error);
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
    let idx = 1;
    return Rx.Observable.create(observer => {
      self.crawler.queue({
        uri: url,
        callback: (err, res) => {
          if (err) observer.error(err);
          else if (res.statusCode == 200) {
            (async () => {
              let { book, chaptersEntryUrl } = await self.options.onBook(res);
              // 如果返回的章节页面链接为false，那么表示详情页与章节页是同一个页面
              if (!chaptersEntryUrl) {
                let { chapter_url_list, nextOpt } = await self.options.onChapters(res);
                observer.next({ bid: book.id, chapter_url_list });
                self._fn_crawler_chapters(observer, book, nextOpt);
              } else {
                self._fn_crawler_chapters(observer, book, chaptersEntryUrl);
              }
            })();
          }
          else observer.error(res);
        }
      });
    }).pipe(
      RxOp.map(({ bid, chapter_url_list }) => _(chapter_url_list).map(chapter_url => _.assign({}, { bid, chapter_url, idx: idx++ }).value())),
      RxOp.mergeMap(chapter_info_list => Rx.from(chapter_info_list)),
      RxOp.take(10)
    );
  }

  _fn_crawler_chapters(observer, book, url) {
    self.crawler.queue({
      uri: url,
      callback: (err, res) => {
        if (err) observer.error(err);
        else if (res.statusCode == 200) {
          (async () => {
            let { chapter_url_list, nextOpt } = await self.options.onChapters(res);
            observer.next({ bid: book.id, chapter_url_list });
            self._fn_crawler_chapters(observer, book, nextOpt);
          })();
        }
        else observer.error(res);
      }
    });
  }

  _fn_crawler_chapter() { }
}

// let crawler = new Crawler({
//   rateLimit: 2000,
//   maxConnections: 1,
//   jQuery: false,
//   userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
// });

// const OpCrawlerBook = uri => {
//   let book = {};
//   Rx.Observable.create(observer => {
//     crawler.queue({
//       uri,
//       callback: (err, res) => {
//         if (err) observer.error(err);
//         else if (res.statusCode == 200) observer.next(res);
//         else observer.error(res);
//         observer.complete();
//       }
//     });
//   }).pipe(
//     RxOp.map(res => {
//       let $ = JQuery.load(res.body);
//       book.title = $().text();
//       book.author = $().text();
//     })
//   );
// };

// Rx.Observable.create(observer => {
//   crawler.queue({
//     uri: "http://mm.remenxs.com/type/",
//     callback: (err, res) => {
//       if (err) observer.error(err);
//       else if (res.statusCode == 200) observer.next(res);
//       else observer.error(res);
//       observer.complete();
//     }
//   });
// }).pipe(
//   RxOp.mergeMap(res => {
//     let $ = JQuery.load(res.body);
//     return Rx.from($(".main .list li"));
//   }),
//   RxOp.map(el => {
//     let $el = JQuery.load(el);
//     return URL.resolve("http://mm.remenxs.com/type/", $el(".bookname a").attr("href"));
//   }),
//   RxOp.mergeMap(url => {
//     //
//   })
// ).subscribe(console.log, console.error);

if (module.main == module) {
  let options = {
    entryUrl: "http://mm.remenxs.com/type/",
    onBooks: (res) => {
      //
    },
    onBook: (res) => {
      //
    },
    onChapters: (res) => {
      
    },
    onChapter: (res) => {
      //
    }
  };
  let engine = new BookCrawler(options);
  engine.start();
}