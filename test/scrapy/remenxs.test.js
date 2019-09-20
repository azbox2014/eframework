const { Subject, Observable } = require("rxjs");
const { map, mergeMap } = require("rxjs/operators");

const Model = require("../../lib/model");
const ScrapyTask = require("../../scrapy/Task");
const Parser = require("../../scrapy/engine/parser/mm.remenxs.com.js");
const Engine = require("../../scrapy/engine");

let app = {
  logger: require("logops")
};
Model(app);

let engine = new Engine(app);
let parser = new Parser(app);

let task = new ScrapyTask({
  url: "https://mm.remenxs.com/type/0_0_0_1.html",
  type: "blist"
});

let count = 0;

Observable.create(observer => {
  observer.next(task);
  observer.complete();
}).pipe(
  parser.mapBList(),
  parser.mapBook(),
  engine._saveBook()
).subscribe({
  next: res => {
    count++;
    // console.log(res)
  },
  error: err => {
    console.error(err)
  },
  complete: () => {
    console.log(count);
    process.exit()
  }
});