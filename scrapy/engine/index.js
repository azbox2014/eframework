const glob = require("glob");
const path = require("path");
const Rx = require("rxjs");
const ScrapyTask = require("../Task");
const RxOp = require("rxjs/operators");

class Engine {
  constructor(app) {
    this.app = app;
    this.logger = app.logger;
    this.$reactor = new Rx.Subject();
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
        RxOp.mergeMap(task => {
          return Rx.of(task).pipe(
            task.parser.mapBList(),
            task.parser.mapBook(),
            self._saveBook()
          )
        }),
        RxOp.mergeMap(task => {
          return Rx.of(task).pipe(

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
      RxOp.map(task => {
        let parserName = this.task.url.replace(/^https?:\/\/|\/[^\.]*$/g, "");
        task.parser = self.parser[parserName];
      })
    );
  }

  _saveBook() {
    let { app } = this;
    return $input => $input.pipe(
      RxOp.mergeMap(task => {
        return Rx.Observable.create(async observer => {
          let book = await app.models.Book.create(task.extra.book);
          let _task = new ScrapyTask({
            url: task.extra.clist_url,
            type: "clist",
            parser: task.parser,
            headers: {},
            extra: {
              book_id: book.id
            }
          });
          observer.next(_task);
          observer.complete();
        });
      })
    );
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
