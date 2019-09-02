const ctx = {};

ctx.logger = require("logops");
ctx.axios = require("./axios")(ctx);


ctx.axios.get("https://www.baidu.com")
  .then(res => {
    // ctx.logger.info(res);
  });