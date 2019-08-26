const _ = require("lodash");
module.exports.get = async (ctx) => {
  const { req, res } = ctx;
  console.log(_.keys(req));
  console.log(_.keys(res));
  res.send('Hello World!');
}