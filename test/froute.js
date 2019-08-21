module.exports = (app, options) => {

  let exportFuncs = require("../router/index");
  app.use(async (ctx, next) => {
    exportFuncs.get(ctx);
  });
  return async (ctx, next) => {
    await next();
  };
}

function formatPath(filePath, root, wildcard) {
  return filePath
    .replace(path.resolve(process.cwd(), root), '')
    .replace(/\\/g, '/')
    .replace(new RegExp('/\\' + wildcard, 'g'), '/:')
    .split('.')[0];
}