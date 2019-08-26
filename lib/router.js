const _ = require("lodash");
const path = require("path");
const express = require('express');
const router = express.Router();
const glob = require("glob");

module.exports.byPath = (app, opts) => {
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
      var exportFuncs = require("../" + root + "/" + filePath);
      var pathRegexp = formatPath(filePath, root, wildcard);
      for (var method in exportFuncs) {
        try {
          exportFuncs[method].pathRegexp = pathRegexp;
          router[method.toLowerCase()](pathRegexp, (req, res, next) => {
            (async (req, res, next) => {
              req.req = req;
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
  let options = _.extend(
    { root: "./controller", wildcard: "+" },
    opts ? (typeof opts === 'string' ? { root: opts } : opts) : {}
  );
  var root = options.root;

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
  Config(app, (pathRegexp, ctl) => {
    router.route(pathRegexp)
      .head(ctl.headAction)
      .options(ctl.optionsAction)
      .get(ctl.getAction)
      .post(ctl.postAction)
      .put(ctl.putAction)
      .delete(ctl.deleteAction);
  });
  return router;
};