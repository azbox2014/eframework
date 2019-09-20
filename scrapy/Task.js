class ScrapyTask {
  constructor(opts) {
    this.url = opts.url;
    this.parser = opts.parser;
    this.type = opts.type;         //blist, book, clist, chapter
    this.headers = opts.headers;
    this.extra = opts.extra;
  }
}

module.exports = ScrapyTask;