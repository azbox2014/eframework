/*
** 小说站：https://mm.remenxs.com/13844/
*/
const BaseParser = require("../BaseParser.js");

class Parser extends BaseParser {
  constructor(app) {
    super(app);
  }
  mapBList() {
    let self = this;
    let { _, url, jquery, ScrapyTask, Axios, Rx, RxOp } = self;
    let axios = Axios(self.app);
    return $input => $input.pipe(
      RxOp.mergeMap(task => {
        return Rx.Observable.create(async observer => {
          let nextUrl = task.url;
          do {
            let res = await axios.get(nextUrl);
            let $ = jquery.load(res.data);
            observer.next({ task, $ });

            nextUrl = $(".main .pagelist a:contains('下一页')");
            if (nextUrl.length > 0) {
              nextUrl = jquery(nextUrl[0]).attr("href");
              nextUrl = url.resolve(task.url, nextUrl);
            } else {
              break;
            }
          } while (true);
          observer.complete();
        });
      }),
      RxOp.mergeMap(({ task, $ }) => {
        return Rx.Observable.create(observer => {
          _.each($("ul.list li"), html => {
            let $li = jquery.load(html);
            let book_url = url.resolve(task.url, $li("p.bookname > a").attr("href"));
            let img_url = $li("a > img").attr("src");
            img_url = /^http/.test(img_url) ? img_url : url.resolve(task.url, img_url);
            let _task = new ScrapyTask({
              url: book_url,
              type: "book",
              headers: {},
              extra: {
                image: img_url,
                title: $li("p.bookname > a").text(),
                author: $li("p.data").eq(0).children("a").text(),
                desc: $li("p.intro").text(),
                status: 1,  // 1.  上架; 2. 部分下架;  3. 部分上架;   4. 下架
                remark: {
                  book_url: book_url,
                  author_url: url.resolve(task.url, $li("p.data").eq(0).children("a").attr("href")),
                  catagory: $li("p.data").eq(0).children("span").first().text(),
                  isEnd: $li("p.data").eq(0).children("span").last().text() == "完结"
                }
              },
            });
            observer.next(_task);
          });
          observer.complete();
        });
      })
    );
  }
  mapBook() {
    let self = this;
    let { app, _, url, jquery, ScrapyTask, Axios, Rx, RxOp } = self;
    let axios = Axios(app);
    return $input => $input.pipe(
      RxOp.mergeMap(task => {
        return Rx.Observable.create(async observer => {
          let book = await app.models.Book.create(task.extra);
          // let res = await axios.get(task.url);
          // let $ = jquery.load(res.data);
          observer.next(book);
          observer.complete();
        });
      })
    );
  }
  mapCList(content) { }
  mapChapter(content) { }
}

module.exports = Parser;