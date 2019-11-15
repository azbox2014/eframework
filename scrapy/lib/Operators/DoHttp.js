const _ = require("lodash");
const Rx = require("rxjs");
const RxOp = require("rxjs/operators");
const Utils = require("../Utils");
const Axios = require("axios");
const Bottleneck = require("bottleneck/es5");

let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36";

class HttpManager {
  constructor() {
    this.limiters = new Bottleneck.Group({
      minTime: 3000,
      maxConcurrent: 1
    });
    this.axios_list = [];
  }

  request({ rule, url, clk }) {
    let self = this;
    self.limiters.key(rule.bookSourceUrl).schedule(() => {
      let axios = self.axios_list[rule.bookSourceUrl];
      if (!axios) {
        self.axios_list[rule.bookSourceUrl] = Axios.create({
          baseURL: rule.bookSourceUrl,
          timeout: 2000,
          headers: {
            "User-Agent": _.isEmpty(rule.httpUserAgent) ? userAgent : rule.httpUserAgent
          }
        });
        axios = self.axios_list[rule.bookSourceUrl];
      }
      return axios.get(url);
    }).then(
      res => clk(null, res),
      err => clk(err, null)
    ).catch(err => clk(err, null));;
  }
}

let httpManager = new HttpManager();


httpOperator = rule => input$ => Rx.Observable.create(observer => {
  input$.subscribe(url => {
    let times = 50;
    let func = () => {
      httpManager.request({
        rule, url, clk: (err, res) => {
          if (err && times > 0) {
            times--;
            func();
          } else {
            if (err) observer.error(err);
            else observer.next(res.data);
            observer.complete();
          }
        }
      });
    };
    func();
  });
});

module.exports = httpOperator;

if (require.main == module) {
  let rule = {
    "bookSourceGroup": "优",
    "bookSourceName": "16K小说网™备用",
    "bookSourceType": "TEXT",
    "bookSourceUrl": "https://www.16kxsw.com",
    "enable": true,
    "httpUserAgent": "",
    "ruleBookAuthor": "class.bq@tag.span.1@text#作者",
    "ruleBookContent": "id.articlecontent@textNodes",
    "ruleBookName": "class.introduce@tag.h1@text",
    "ruleChapterList": "class.ml_list@tag.li",
    "ruleChapterName": "tag.a@text",
    "ruleChapterUrl": "class.cataloglink@tag.p.0@tag.a@href",
    "ruleChapterUrlNext": "",
    "ruleContentUrl": "tag.a@href",
    "ruleContentUrlNext": "",
    "ruleCoverUrl": "class.pic@tag.img.0@src",
    "ruleFindUrl": "",
    "ruleIntroduce": "class.jj@text",
    "ruleSearchAuthor": "class.p1@tag.a@text||tag.td.2@text",
    "ruleSearchCoverUrl": "class.pic@tag.img@src",
    "ruleSearchKind": "tag.td.4@text",
    "ruleSearchLastChapter": "tag.td.1@text",
    "ruleSearchList": "class.tt||class.grid@tag.tr!0",
    "ruleSearchName": "tag.h3@tag.a@text||tag.td.0@text",
    "ruleSearchNoteUrl": "tag.h3@tag.a@href||tag.td.0@tag.a@href",
    "ruleSearchUrl": "http://www.16kxsw.com/modules/article/search.php?searchkey=searchKey|char=gbk",
    "serialNumber": 0,
    "weight": 36
  };
  Rx
    .of("https://www.baidu.com")
    .pipe(
      httpOperator(rule)
    ).subscribe(console.log, console.error);
}