module.exports = app => {
  class Index extends app.Controller {
    constructor() {
      super();
    }

    async getAction(ctx) {
      const { res, logger, app } = ctx;
      app.model.Book
        .forge({
          title: "title",
          author: "author",
          cover: "cover",
          desc: "desc"
        })
        .save()
        .then(res => {
          logger.info("保存成功");
          console.log(res);
        });
      res.send("99");
    }

    postAction(ctx) {
      console.log(ctx);
      const { res, logger, app } = ctx;
      res.send(JSON.stringify(ctx));
    }
  }
  return Index;
}