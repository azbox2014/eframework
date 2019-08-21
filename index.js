const _ = require("lodash");
const Koa = require("koa");
const Router = require("./lib/frouter");
// const Router = require("./test/froute");
// const Router = require("koa-frouter");

const logger = require("./lib/logger");
const app = new Koa();

app.use(logger());
app.use(async (ctx, next) => {
  ctx.body = 'Hello World';
  // console.log(ctx);
  await next();
});

app.use(Router(app, {
  root: "./router",
  wildcard: ":"
}));

app.listen(3000);