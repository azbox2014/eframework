const dbConfig = require("../config/db.config");
const knex = require("knex")(dbConfig);
const glob = require("glob");

Promise
  .all(
    glob
      .sync("db_**.js", { cwd: __dirname })
      .map(f => {
        let createFunc = require("./" + f);
        createFunc(knex);
      })
  )
  .then(() => console.log("Initialize Completed!"))
  .finally(() => knex.destroy());
