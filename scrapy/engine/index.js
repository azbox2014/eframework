const { Subject } = require("rxjs");
const { map, mergeMap } = require("rxjs/operator");

class Engine {
  constructor(ctx) {
    this.logger = ctx.logger;
    this.axios = ctx.axios;
    this.jquery = ctx.jquery;
    this.$reactor = new Subject();
    this.endClk = ctx.endClk;
    // let parserName = this.task.url.replace(/^https?:\/\/|\/[^\.]*$/g, "");
    // this.parser = ctx.parser[parserName];
  }

  push(task) {
    this.$reactor.next(task);
  }

  end() {
    this.$reactor.complete();
  }
}

module.exports = Engine;
