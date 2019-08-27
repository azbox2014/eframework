const Express = require("express");
const router = require("./router");
const logger = require("./logger");
const model = require("./model");

let app = Express();
app.use(ctx => {
  model(app);
  ctx.app = app;
  ctx.req = ctx;
  ctx.next();
});
app.use(logger());
app.use(router.rewrite("/abc/:abc","/user/my/:abc"));
app.use(router.byPath(app));
app.use(router.byConfig(app));

module.exports = app;
