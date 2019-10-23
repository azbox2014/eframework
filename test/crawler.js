let _ = require("lodash");
let URL = require("url");
let Rx = require("rxjs");
let RxOp = require("rxjs/operators");
let JQuery = require("cheerio");
let Crawler = require("crawler");

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

