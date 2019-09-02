module.exports = app => {
  class Book extends app.Controller {
    constructor() {
      super();
    }

    async getAction(ctx) {
      const { res} = ctx;
      res.send("99");
    }
  }
  return Book;
}