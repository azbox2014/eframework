module.exports = () => {
  process.on("message", msg => {
    console.log(msg);
    const app = require("./app");
    app.listen(3000);
  });
};
