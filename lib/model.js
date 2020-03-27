const config = require("../config/db.config");
const glob = require("glob");

module.exports = app => {
  const root = "./model";
  const db = new Sequelize(config);
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
      parent[lastName] = db.import("../" + root + "/" + filePath);
    });
  return ctx => ctx.next();
}
