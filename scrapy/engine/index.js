const glob = require("glob");
const path = require("path");
const { Subject, Observable } = require("rxjs");
const { map, mergeMap } = require("rxjs/operators");

class Engine {
  constructor(ctx) {
    this.logger = ctx.logger;
    this.axios = ctx.axios;
    this.jquery = ctx.jquery;
    this.$reactor = new Subject();
    this.parser = ctx.parser;
    this.endClk = ctx.endClk;
    // let parserName = this.task.url.replace(/^https?:\/\/|\/[^\.]*$/g, "");
    // this.parser = ctx.parser[parserName];
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
        self.parser[lastName] = new Parser();
      });
  }

  _init_chain() {
    let self = this;
    self.$reactor
      .pipe(
        self._parser(),
        self._scrapy()
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
          let $ = self.jquery.load(res.data);
          if (task.type == "book") {
            task.result = task.parser.getBook($);
          } else if(task.type == "clist") {
            task.result = task.parser.getChapterList($);
          } else if(task.type == "chapter") {
            task.result = task.parser.getChapter($);
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
