const Express = require("express");
const router = require("./router");
// const logger = require("./logger");

let app = Express();
app.use(router.byPath(app));
app.use(router.byConfig(app));
// app.use(logger());

module.exports = app;







