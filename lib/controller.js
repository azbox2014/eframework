module.exports = app => {
  class Base {
    constructor() {}
    headAction() {}
    optionsAction() {}
    getAction() {}
    postAction() {}
    putAction() {}
    deleteAction() {}
  }
  app.Controller = Base;
}
