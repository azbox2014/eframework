const app = {};
const _ = require("lodash");
const Model = require("../lib/model");

app.logger = require("logops");
// app.axios = require("./axios")(app);
// app.jquery = require("./jquery")(app);
Model(app);


app.axios.setUA("ios");
app.axios.setReferer("https://m.remen88.com/dayvisit_1/");
app.axios.get("https://mm.remenxs.com/13844/")
  .then(async res => {
    let $ = app.jquery.load(res.data);
    let res2 = await app.models.Book.create({
      image: $("#read .main .detail img").attr("src"),
      title: $("#read .main .detail .name").text(),
      author: $("#read .main .detail .author a").text(),
      status: 1
    });
    app.logger.info({ res2 });
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit();
  });