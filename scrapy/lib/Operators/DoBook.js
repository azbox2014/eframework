const Rx = require("rxjs");
const RxOp = require("rxjs/operators");
const ContentAnalyze = require("../Analyze");

let doBookInfoOperator = rule => input$ => input$.pipe(
  RxOp.map(data => {
    let analyse = '';
  })
);

if (require.main == module) {
  console.log('ll');
}