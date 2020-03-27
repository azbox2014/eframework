const cluster = require("cluster");
const Express = require("express");
const router = require("./router");
const logger = require("./logger");
const model = require("./model");

const newApp = () => {
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
  app.use(router.rewrite("/abc/:abc", "/user/my/:abc"));
  // app.use(router.byPath(app));
  app.use(router.byConfig(app));

  app.use((req, res) => {
    res.status(404);
    res.send("not found");
  });
  return app;
}

const startMaster = () => {
  [1,2,3,4].forEach(it => {
    let worker = cluster.fork();
    worker.send(it);
  });
};

const startWorker = () => {
  process.on("message", msg => {
    console.log("Start worker: ", msg);
    const app = newApp();
    app.listen(3000);
  });
};

if (cluster.isMaster) {
  startMaster();
} else {
  startWorker();
}