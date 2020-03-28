const ByJSDom = require("./ByJSDom");
const ByRegex = require("./ByRegex");
const ByXPath = require("./ByXPath");

class ContentAnalyze {
  constructor(res_data) {
    this.res_data = res_data;
  }

  getValue(rule_txt) {
    if (ByJSDom.isMatch(rule_txt)) {
      ByJSDom.getValue(this.res_data, rule_txt);
    } else if (ByRegex.isMatch(rule_txt)) {
      ByRegex.getValue(this.res_data, rule_txt);
    } else if (ByXPath.isMatch(rule_txt)) {
      ByXPath.getValue(this.res_data, rule_txt);
    } else {
      return "";
    }
  }
}

module.exports = ContentAnalyze;