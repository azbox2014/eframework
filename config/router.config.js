module.exports = (app, router) => {
  router.get("/", app.ctl.index.getAction);
}