module.exports.get = async (ctx, next) => {
  ctx.body = 'Hello World!';
  ctx.status = 200;
  //ctx.redirect("http://www.baidu.com/");
}