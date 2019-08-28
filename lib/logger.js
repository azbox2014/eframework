const uuid = require("uuid");
const logger = require("logops");
const hostname = require("os").hostname();
const config = require("../config/log.config");

logger.getContext = () => {
  return {
    scope: "app",
    hostname,
    pid: process.pid
  }
};

module.exports = function (app) {
  app.logger = logger;
  return ctx => {
    let { next } = ctx;
    ctx.logger = logger.child({
      scope: "ctx",
      reqId: uuid.v4()
    });
    next();
  }
}
