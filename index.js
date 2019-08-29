// const app = require("./lib/app");

// app.listen(3000);

// require("./lib/master");


const cluster = require("cluster");
const startMaster = require("./lib/master");
const startWorker = require("./lib/worker");

if (cluster.isMaster) {
  startMaster(cluster);
} else {
  startWorker();
}