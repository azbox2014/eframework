const _ = require("lodash");
const Rx = require("rxjs");
const RxOp = require("rxjs/operators");

const HttpOp = require("../lib/Operators/Http");
const ChapterListOp = require("../lib/Operators/ChapterList");

const BookInfoBean = require("./BookInfo");

class ChapterListBean {
  getChapterList(bookUrl, rule) {
    let bookInfoBean = new BookInfoBean();
    return bookInfoBean.getBookInfo(bookUrl, rule)
      .pipe(
        $input => $input.pipe(
          RxOp.map(bookInfo => {
            let chapterList$ = Rx.Observable.create(observer => {
              let handlerChapters = ({ chapters, nextUrl }) => {
                observer.next(chapters);
                if (nextUrl) {
                  getNextList(nextUrl);
                } else observer.complete();
              };
              let getNextList = url => {
                Rx.of(url).pipe(
                  HttpOp(rule),
                  ChapterListOp(rule)
                ).subscribe(
                  handlerChapters,
                  observer.error
                );
              };
              if (!_.isEmpty(bookInfo.ruleChapterListUrl)) {
                getNextList(bookInfo.ruleChapterListUrl)
              } else if(bookInfo.chapters$) {
                bookInfo.chapters$.pipe(
                  ChapterListOp(rule)
                ).subscribe(
                  handlerChapters,
                  observer.error
                );
              } else observer.complete();
            }).pipe(
              RxOp.mergeMap(chapters => Rx.from(chapters))
            );
            return {
              bookInfo,
              chapterList$: chapterList$
            };
          })
        )
      );
  }
}