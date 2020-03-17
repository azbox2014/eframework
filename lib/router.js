const _ = require("lodash");
const express = require('express');
const glob = require("glob");
const toRegexp = require('path-to-regexp').pathToRegexp;

module.exports.byPath = (app, opts) => {
  const router = express.Router();
  let options = _.extend(
    { root: "./router", wildcard: "+" },
    opts ? (typeof opts === 'string' ? { root: opts } : opts) : {}
  );
  var wildcard = options.wildcard;
  var root = options.root;

  function formatPath(filePath) {
    return filePath
      .replace(/\\/g, '/')
      .replace(new RegExp('/\\' + wildcard, 'g'), '/:')
      .split('.')[0];
  }

  glob
    .sync("**/*.js", { cwd: root })
    .sort((p1, p2) => {
      const com = (_p1, _p2) => {
        let idx1 = _p1.indexOf('/');
        let idx2 = _p2.indexOf('/');
        let f1, f2;
        if(idx1 < 0 && idx2 < 0) {
          
        }
        f1 = _p1.substring(0, idx1);
        f2 = _p2.substring(0, idx2);
      }
    })
    .forEach(function (filePath) {
      console.log(filePath);
      filePath = "/" + filePath;
      let exportFuncs = require("../" + root + filePath);
      let pathRegexp = formatPath(filePath);
      for (let method in exportFuncs) {
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
  Config(app, router);
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
