module.exports = () => {
  process.on("message", data => {
    console.log("start worker: " + data.id + ", listen: " + data.port);
    const app = require("./app");
    app.listen(data.port);
  });
};
