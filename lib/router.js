const _ = require("lodash");
const express = require('express');
const glob = require("glob");
const toRegexp = require('path-to-regexp');

module.exports.byPath = (app, opts) => {
  const router = express.Router();
  let options = _.extend(
    { root: "./router", wildcard: "+" },
    opts ? (typeof opts === 'string' ? { root: opts } : opts) : {}
  );
  var wildcard = options.wildcard;
  var root = options.root;

  function formatPath(filePath, root, wildcard) {
    return filePath
      .replace(/\\/g, '/')
      .replace(new RegExp('/\\' + wildcard, 'g'), '/:')
      .split('.')[0];
  }

  glob
    .sync("**/*.js", { cwd: root })
    .sort()
    .reverse()
    .forEach(function (filePath) {
      filePath = "/" + filePath;
      var exportFuncs = require("../" + root + filePath);
      var pathRegexp = formatPath(filePath, root, wildcard);
      for (var method in exportFuncs) {
        try {
          exportFuncs[method].pathRegexp = pathRegexp;
          router[method.toLowerCase()](pathRegexp, (req, res, next) => {
            (async (req, res, next) => {
              await exportFuncs[method](req, res, next);
            })(req, res, next)
              .catch((err) => next(err))
          });
        } catch (e) {
          console.error(e);
        }
      };
    });
  return router;
};

module.exports.byConfig = (app, opts) => {
  const router = express.Router();
  let options = _.extend(
    { root: "./controller", wildcard: "+" },
    opts ? (typeof opts === 'string' ? { root: opts } : opts) : {}
  );
  var root = options.root;

  const actionWrap = fn => (req, res, next) => {
    (async (req, res, next) => {
      await fn(req, res, next);
    })(req, res, next)
      .catch((err) => next(err))
  };

  const Config = require("../config/router.config");
  require("./controller")(app);

  app.ctl = app.ctl ? app.ctl : {};
  glob
    .sync("**/*.js", { cwd: root })
    .forEach(filePath => {
      let parent = app;
      let lastName = "ctl";
      filePath
        .replace(/\.js$/, '')
        .split("/")
        .forEach(name => {
          parent = parent[lastName];
          parent[name] = parent[name] ? parent[name] : {};
          lastName = name;
        });
      let Ctl = require("../" + root + "/" + filePath)(app);
      parent[lastName] = new Ctl();
    });
  Config(app, (match, ctl) => {
    router.head(match, ctl.headAction);
    router.options(match, ctl.optionsAction);
    router.get(match, ctl.getAction);
    router.post(match, ctl.postAction);
    router.put(match, ctl.putAction);
    router.delete(match, ctl.deleteAction);
  });
  return router;
};

module.exports.rewrite = (src, dst) => {
  var keys = [], re, map;
  function toMap(params) {
    var map = {};

    params.forEach(function (param, i) {
      param.index = i;
      map[param.name] = param;
    });

    return map;
  }

  if (dst) {
    re = toRegexp(src, keys);
    map = toMap(keys);
  }

  return function (req, res, next) {
    var orig = req.url;
    var m;
    if (dst) {
      m = re.exec(orig);
      if (!m) {
        return next();
      }
    }
    req.url = req.originalUrl = (dst || src).replace(/\$(\d+)|(?::(\w+))/g, function (_, n, name) {
      if (name) {
        if (m) return m[map[name].index + 1];
        else return req.params[name];
      } else if (m) {
        return m[n];
      } else {
        return req.params[n];
      }
    });
    if (req.url.indexOf('?') > 0) {
      req.query = URL.parse(req.url, true).query;
    }
    if (dst) next();
    else next('route');
  }
}
