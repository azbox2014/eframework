const { Subject, Observable } = require("rxjs");
const { map, mergeMap } = require("rxjs/operator");

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
          if (task.type == "book") {
            // let book = self.
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
