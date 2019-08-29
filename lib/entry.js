const cluster = require("cluster");
const startMaster = require("./master");
const startWorker = require("./worker");

if (cluster.isMaster) {
  startMaster(cluster);
} else {
  startWorker();
}