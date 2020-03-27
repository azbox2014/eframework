const config = require("../config/db.config");
const knex = require("knex")(config);
const BF = require("bookshelf")(knex);
const glob = require("glob");

module.exports = app => {
  const root = "./model";
  app.models = {};
  glob
    .sync("**/*.js", { cwd: root })
    .forEach(filePath => {
      let parent = app;
      let lastName = "models";
      filePath
        .replace(/\.js$/, '')
        .split("/")
        .forEach(name => {
          parent = parent[lastName];
          parent[name] = parent[name] ? parent[name] : {};
          lastName = name;
        });
      parent[lastName] = db.import("../" + root + "/" + filePath)(BF);
    });
  return ctx => ctx.next();
}
