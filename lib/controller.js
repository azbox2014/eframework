module.exports = app => {
  class Base {
    constructor() { }
    headAction(ctx) {
      ctx.next();
    }
    optionsAction(ctx) {
      ctx.next();
    }
    getAction(ctx) {
      ctx.next();
    }
    postAction(ctx) {
      ctx.next();
    }
    putAction(ctx) {
      ctx.next();
    }
    deleteAction(ctx) {
      ctx.next();
    }
  }
  app.Controller = Base;
}
