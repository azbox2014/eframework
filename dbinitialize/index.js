const dbConfig = require("../config/db.config");
const knex = require("knex")(dbConfig);
const glob = require("glob");

let delay = knex.schema;

glob
    .sync("db_**.js", { cwd: __dirname })
    .map(f => {
        let args = require("./" + f);
        delay = delay.createTable(...args);
    });

delay
    .then(console.log)
    .catch(console.log)
    .finally(() => process.exit(0));

