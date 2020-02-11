module.exports = (cluster) => {
  let port = 3000;
  [1,2,3,4].forEach(id => {
    let worker = cluster.fork();
    worker.send({id, port});
  });
};
