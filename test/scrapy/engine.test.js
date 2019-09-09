const Engine = require("../../scrapy/engine");

let ctx = {
  logger: {},
  axios: {},
  jquery: {},
  endClk: {}
};

let engine = new Engine(ctx);

engine._load_parser();
console.log(engine.parser);