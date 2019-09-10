const glob = require("glob");
const path = require("path");
const { Subject, Observable, of } = require("rxjs");
const { map, mergeMap } = require("rxjs/operators");

class Engine {
  constructor(app) {
    this.app = app;
    this.logger = app.logger;
    this.$reactor = new Subject();
    this._load_parser();
  }

  _load_parser() {
    let self = this;
    let root = path.resolve(process.cwd(), "scrapy/engine/parser");
    self.parser = {};
    glob
      .sync("**/*.js", { cwd: root })
      .forEach(filePath => {
        let lastName = filePath.replace(/^\.\/|\.js$/g, '');
        let Parser = require(path.resolve(root, filePath));
        self.parser[lastName] = new Parser(self.app);
      });
  }

  _init_chain() {
    let self = this;
    self.$reactor
      .pipe(
        self._parser(),
        mergeMap(task => {
          return of(task).pipe(
            task.parser.mapBList(),
            task.parser.mapBook()
          )
        })
      )
      .subscribe(
        this._save,
        this._error,
        this._complete
      );
  }

  _parser() {
    let self = this;
    return $input => $input.pipe(
      map(task => {
        let parserName = this.task.url.replace(/^https?:\/\/|\/[^\.]*$/g, "");
        task.parser = self.parser[parserName];
      })
    );
  }

  _scrapy() {
    let self = this;
    return $input => Observable.create(observer => {
      $input.subscribe(
        async task => {
          let res = await self.axios.get(task.url, { headers: task.headers });
          if (task.type == "book") {
            task.result = task.parser.getBook(res.data);
          } else if(task.type == "clist") {
            task.result = task.parser.getCList(res.data);
            let nextUrl = task.parser.getCListNextUrl(res.data);
            while (nextUrl) {
              res = await self.axios.get(nextUrl, { headers: task.headers });
              task.result.push(...task.parser.getCList(res.data));
              nextUrl = task.parser.getCListNextUrl(res.data);
            }
          } else if(task.type == "chapter") {
            task.result = task.parser.getChapter(res.data);
          } else {
            observer.next(task);
          }
        },
        err => observer.error(err),
        () => observer.complete()
      );
    });
  }

  _save(task) {
    //
  }

  _error() { }

  _complete() {
    if (this.endClk) {
      this.endClk();
    }
    process.exit();
  }

  push(task) {
    this.$reactor.next(task);
  }

  end() {
    this.$reactor.complete();
  }
}

module.exports = Engine;
