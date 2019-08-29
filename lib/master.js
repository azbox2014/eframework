module.exports = (cluster) => {
  // let worker = cluster.fork();
  // worker.send("start");
  [1,2,3,4].forEach(it => {
    let worker = cluster.fork();
    worker.send(it);
  });
};
