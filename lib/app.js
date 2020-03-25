const Express = require("express");
const router = require("./router");
const logger = require("./logger");
const model = require("./model");

let app = Express();
app.use(ctx => {
  ctx.app = app;
  ctx.req = ctx;
  ctx.next();
});
app.use(logger(app));
app.use(ctx => {
  ctx.logger.info(ctx.req.headers);
  ctx.next();
});
app.use(model(app));
app.use(router.rewrite("/abc/:abc","/user/my/:abc"));
app.use(router.byPath(app));
app.use(router.byConfig(app));

app.use((req, res) => {
  res.status(404);
  res.send("not found");
});

module.exports = app;
