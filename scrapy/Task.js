class ScrapyTask {
  constructor(opts) {
    this.url = opts.url;
    this.type = opts.type;         //blist, book, clist, chapter
    this.headers = opts.headers;
    this.extra = opts.extra;
  }
}

module.exports = ScrapyTask;