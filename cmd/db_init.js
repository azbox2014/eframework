const _ = require("lodash");
const { Observable, from } = require("rxjs");
const { map, mergeMap } = require("rxjs/operators");
const Model = require("../lib/model");

let ctx = {};
Model(ctx);

from(_.keys(ctx.models))
  .pipe(
    map(name => ctx.models[name]),
    mergeMap(model => Observable.create(async ob => {
      let res = await model.sync({ force: true });
      ob.next(res);
      ob.complete();
    }))
  ).subscribe({
    complete: () => {
      console.log('ok');
      process.exit(0);
    }
  });
