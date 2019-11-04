const Rx = require("rxjs");
const RxOp = require("rxjs/operators");

const SourceRuleModel = require("../models/SourceRule");

class SourceRulesBean {
  constructor(adapter) {
    this.adapter = adapter;
    this.cursor = false;
  }

  getAllRules() {
    let self = this;
    return Rx.Observable.create(observer => {
      self.adapter.getAllRules(self.cursor, (err, raw_rules, cursor) => {
        self.cursor = cursor;
        if (err) observer.error(err);
        else observer.next(raw_rules);
        observer.complete();
      })
    }).pipe(
      RxOp.mergeMap(raw_rules => Rx.from(raw_rules)),
      RxOp.map(raw_rule => new SourceRuleModel(raw_rule))
    );
  }

  getRule(sourceUrl) {
    let self = this;
    return Rx.Observable.create(observer => {
      self.adapter.getRule(sourceUrl, (err, raw_rule) => {
        if (err) observer.error(err);
        else observer.next(raw_rule);
        observer.complete();
      });
    }).pipe(
      RxOp.map(raw_rule => new SourceRuleModel(raw_rule))
    );
  }
}