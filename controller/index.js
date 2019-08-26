module.exports = app => {
  class Index extends app.Controller {
    constructor() {
      super();
      console.log(this.headAction);
    }

    getAction(ctx) {
      const { res } = ctx;
      res.send("oo");
    }
  }
  return Index;
}