module.exports = app => {
  class Index extends app.Controller {
    constructor() {
      super();
    }

    async getAction(ctx) {
      const { res, logger, app } = ctx;
      // logger.info({ app: ctx.app});
      let user = await app.models.User.build({
        username: "John",
        nickname: "Idler",
        avatar: "xx",
        phone: "18681817262",
        gender: 1,
        status: 1,
      });
      user.save();
      res.send("99");
    }
  }
  return Index;
}