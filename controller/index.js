module.exports = app => {
  class Index extends app.Controller {
    constructor() {
      super();
    }

    getAction(ctx) {
      const { res, logger, app } = ctx;
      logger.info({ models: app.models});
      res.send("oo");
    }
  }
  return Index;
}