class ScrapyTask {
  constructor(opts) {
    this.url = opts.url;
    this.type = opts.type;         // book, clist, chapter
    this.headers = opts.headers;
    this.extra = opts.extra;
  }
}