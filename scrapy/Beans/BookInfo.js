const Rx = require("rxjs");
const RxOp = require("rxjs/operators");

const HttpOp = require("../lib/Operators/DoHttp");
const BookInfoOp = require("../lib/Operators/DoBookInfo");

class BookInfoBean {
  getBookInfo(url, rule) {
    return Rx.of(url)
      .pipe(
        HttpOp(rule),
        BookInfoOp(rule)
      );
  }
}