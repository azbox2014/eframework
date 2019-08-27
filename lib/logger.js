const uuid = require("uuid");
const logger = require("logops");
const hostname = require("os").hostname();
const config = require("../config/log.config");

logger.getContext = () => {
  return {
    hostname,
    pid: process.pid
  }
};

module.exports = function (opts) {
  return ctx => {
    let { next } = ctx;
    ctx.logger = logger.child({
      reqId: uuid.v4()
    });
    next();
  }
}
