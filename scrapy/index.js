const app = {};
const _ = require("lodash");
const Model = require("../lib/model");
const ScrapyTask = require("./Task");
const Engine = require("./engine");

app.logger = require("logops");
// app.axios = require("./axios")(app);
// app.jquery = require("./jquery")(app);
Model(app);

let task = new ScrapyTask({
  url: "https://mm.remenxs.com/type/0_0_0_1.html",
  type: "blist"
});

let engine = new Engine(app);
engine.push(task);
engine.end();

