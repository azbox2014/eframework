const _ = require("lodash");
const { ByJSDom, ByRegex, ByXPath } = require("../lib/Analyze");

const parsePage = (pageContent, rule) => {
    if (ByJSDom.isMatch(rule)) {
        ByXPath.getValue(pageContent, rule);
    } else if (ByRegex.isMatch(rule)) {
        ByXPath.getValue(pageContent, rule);
    } else if (ByXPath.isMatch(rule)) {
        ByXPath.getValue(pageContent, rule);
    } else {
        throw "Can't recognize the rule: \"" + rule + "\"";
    }
}

module.exports = (pageContent, rules) => {
    let _rules = [];
    if (_.isString(rules)) _rules.push(rules);
    else if (_.isArray(rules)) _rules = _.concat(rules);
    else throw "The rule \"" + JSON.stringify(rules) + "\" is not valid.";

    if (_.isEmpty(pageContent)) throw "The page content is empty.";
}