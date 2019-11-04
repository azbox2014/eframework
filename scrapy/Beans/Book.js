const Rx = require("rxjs");
const RxOp = require("rxjs/operators");

const DoHttp = require("../lib/Operators/DoHttp");
const DoBookInfo = require("../lib/Operators/DoBookInfo");
const DoChapter = require("../lib/Operators/DoChapter");
const DoChapterContent = require("../lib/Operators/DoChapterContent");

class BookBean {
  getBookInfo({ url, rule }) {
    return Rx.of(url)
      .pipe(
        DoHttp(rule),
        DoBookInfo(rule)
      );
  }

  getChapterList({ bookInfo, rule }) {
    return Rx.of(bookInfo)
      .pipe(
        $input => $input.pipe(
          RxOp.map(bookInfo => {
            let idx = 1;
            return Rx.Observable.create(observer => {
              let handlerChapters = ({ chapters, nextUrl }) => {
                observer.next(chapters);
                if (nextUrl) {
                  getNextList(nextUrl);
                } else observer.complete();
              };
              let getNextList = url => {
                Rx.of(url).pipe(
                  DoHttp(rule),
                  DoChapter(rule)
                ).subscribe(
                  handlerChapters,
                  observer.error
                );
              };
              if (!_.isEmpty(bookInfo.ChapterUrl)) {
                getNextList(bookInfo.ChapterUrl)
              } else if (bookInfo.Chapters$) {
                bookInfo.chapters$.pipe(
                  DoChapter(rule)
                ).subscribe(
                  handlerChapters,
                  observer.error
                );
              } else observer.complete();
            }).pipe(
              RxOp.mergeMap(chapters => Rx.from(chapters)),
              RxOp.map(item => _.assign(item, { Index: idx++ }))
            );
          })
        )
      );
  }

  getChapterContent({ chapterInfo, rule }) {
    return Rx.of(chapterInfo)
      .pipe(
        $input => $input.pipe(
          RxOp.map(info => {
            return Rx.of(info.url).pipe(DoHttp(rule), DoChapterContent(rule));
          })
        )
      );
  }

  getBook$(url, rule) {
    let self = this;
    return self.getBookInfo({ url, rule })
      .pipe(
        RxOp.map(bookInfo => {
          let Chapters$ = self.getChapterList({ bookInfo, rule })
            .pipe(
              RxOp.map(chapterInfo => {
                let Content$ = self.getChapterContent({ chapterInfo, rule });
                chapterInfo.Content$ = Content$;
                return chapterInfo;
              })
            );
          bookInfo.Chapters$ = Chapters$;
          return bookInfo;
        })
      );
  }
}

module.exports = BookBean;