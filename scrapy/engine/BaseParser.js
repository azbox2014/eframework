const _ = require("lodash");
const url = require('url');
const Axios = require("../axios");
const jquery = require("../jquery");
const ScrapyTask = require("../Task");
const Rx = require("rxjs");
const RxOp = require("rxjs/operators");



class BaseParser {
  constructor(app) {
    this.app = app;
    this.Axios = Axios;
    this.ScrapyTask = ScrapyTask;
    this.jquery = jquery;
    this.Rx = Rx;
    this.RxOp = RxOp;
    this.url = url;
    this._ = _;
  }
  mapBList() { }
  mapBook() { }
  mapCList() { }
  mapChapter() { }
}

module.exports = BaseParser;