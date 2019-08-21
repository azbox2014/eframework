var path = require('path');
var ls = require('ls-sync');
var methods = require('methods');
var toRegexp = require('path-to-regexp');

let route = (() => {
  let route = {};
  methods.forEach(function(method){
    route[method] = create(method);
  });
  
  route.del = route.delete;
  route.all = create();
  
  function create(method) {
    if (method) method = method.toUpperCase();
  
    return function(path, fn, opts){
      var re = toRegexp(path, opts);
  
      return async (ctx, next) => {
        var m;
  
        // method
        if (!matches(ctx, method)) return await next();
  
        // path
        if (m = re.exec(ctx.request.url)) {
          let args = [];
          args.push(ctx);
          args.push(next);
          ctx.params = m.slice(1).map(decode);
          fn.apply(null, args);
          return;
        }
  
        // miss
        return await next();
      }
    }
  }
  
  /**
   * Decode value.
   */
  
  function decode(val) {
    if (val) return decodeURIComponent(val);
  }
  
  /**
   * Check request method.
   */
  
  function matches(ctx, method) {
    if (!method) return true;
    if (ctx.method === method) return true;
    if (method === 'GET' && ctx.method === 'HEAD') return true;
    return false;
  }

  return route;  
})();

let rewrite = (src, dst) => {
  function toMap(params) {
    var map = {};
  
    params.forEach(function (param, i) {
      param.index = i;
      map[param.name] = param;
    });
  
    return map;
  };

  var keys = [];
  var re = toRegexp(src, keys);
  var map = toMap(keys);

  return async (ctx, next) => {
    var orig = ctx.request.url;
    var m = re.exec(orig);

    if (m) {
      ctx.path = dst.replace(/\$(\d+)|(?::(\w+))/g, function (_, n, name) {
        if (name) return m[map[name].index + 1];
        return m[n];
      });
      await next();

      ctx.path = orig;
      return;
    }

    next();
  }
}

module.exports = function (app, options) {
  if (typeof options === 'string') {
    options = {root: options};
  } else if (!options || !options.root) {
    throw new Error('`root` config required.');
  }
  var wildcard = options.wildcard || '*';
  var root = options.root;

  //rewrite / to /index
  app.use(rewrite('/', '/index'));

  ls(root).forEach(function (filePath) {
    if (path.extname(filePath) !== '.js') {
      return;
    }
    var exportFuncs = require(filePath);
    var pathRegexp = formatPath(filePath, root, wildcard);
    for (var method in exportFuncs) {
      try {
        exportFuncs[method].pathRegexp = pathRegexp;
        app.use(route[method.toLowerCase()](pathRegexp, exportFuncs[method]));
      } catch (e) {}
    };
  });

  return async (ctx, next) => {
    await next();
  };
};

function formatPath(filePath, root, wildcard) {
  return filePath
    .replace(path.resolve(process.cwd(), root), '')
    .replace(/\\/g, '/')
    .replace(new RegExp('/\\' + wildcard, 'g'), '/:')
    .split('.')[0];
}