const ctx = {};
const _ = require("lodash");
const Model = require("../lib/model");

ctx.logger = require("logops");
ctx.axios = require("./axios")(ctx);
ctx.jquery = require("./jquery")(ctx);
Model(ctx);


ctx.axios.setUA("ios");
ctx.axios.setReferer("https://m.remen88.com/dayvisit_1/");
ctx.axios.get("https://mm.remenxs.com/13844/")
  .then(async res => {
    let $ = ctx.jquery.load(res.data);
    let res2 = await ctx.models.Book.create({
      image: $("#read .main .detail img").attr("src"),
      title: $("#read .main .detail .name").text(),
      author: $("#read .main .detail .author a").text(),
      status: 1
    });
    ctx.logger.info({ res2 });
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit();
  });