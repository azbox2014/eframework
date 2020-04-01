const _ = require("lodash");
const XSelector = require("xselector");

const getLastRuleParser = rule => {
  const getTextParser = () => {
    let rep_str = _.nth(rule.split("#"), 1);
    let reg = rep_str ? new RegExp(rep_str) : false;
    return dom => {
      let result = dom.text();
      return reg ? result.replace(reg, "") : result;
    }
  }

  const getTextNodesParser = () => {
    let rep_str = _.nth(rule.split("#"), 1);
    let reg = new RegExp(rep_str);
    return dom => {
      let result = dom.html();
      return reg ? result.replace(reg, "") : result;
    }
  }

  if (/^text/i.test(rule)) {
    return this.getTextParser();
  } else if (/^textNodes/i.test(rule)) {
    return getTextNodesParser();
  }
  console.log("The last rule isn't match: ", rule);
  return () => "";
}

const getFrontRuleParser = rule => {

  const getNthCss = (selector, idx) => {
    if (idx && /^\d+$/.test(idx)) {
      let _idx = parseInt(idx) + 1;
      return selector + ":nth-child(" + _idx + ")";
    }
    return selector;
  }

  const getIDParser = () => {
    let [id] = _.slice(rule.split('.'), 1);
    return dom => dom.css("#" + id);
  }

  const getClassParser = () => {
    let [cls, idx] = _.slice(rule.split("."), 1);
    let css_selector = this.getNthCss("." + cls, idx);
    return dom => dom.css(css_selector);
  }

  const getTagParser = () => {
    let css_selector = this.getNthCss(..._.slice(rule.split("."), 1));
    return dom => dom.css(css_selector);
  }

  const getTextParser = () => {
    let [txt, idx] = _.slice(rule.split("."), 1);
    let css_selector = this.getNthCss("*[contains(text(),'" + txt + "')]", idx);
    return dom => dom.css(css_selector);
  }

  if (/^id$/i.test(rule)) {
    return getIDParser();
  } else if (/^class$/i.test(rule)) {
    return getClassParser();
  } else if (/^tag$/i.test(rule)) {
    return getTagParser();
  } else if (/^text$/i.test(rule)) {
    return getTextParser();
  }
  console.log("The rule isn't match: ", rule);
  return dom => dom;
}

module.exports = {
  isMatch: rule => {
    return /^class|^id|^tag|^text|^href/i.test(rule);
  },
  getTxtParser: rule => {
    let rules_list = rule.split("@");
    let frontRules = _.slice(rules_list, 0, -1);
    let lastRule = _.nth(rules_list, -1);
    let rule_func = frontRules.map(getFrontRuleParser);
    let lastRule_func = getLastRuleParser(lastRule);
    return page => {
      let dom = XSelector.load(page);
      rule_func.forEach(f => {
        dom = f(dom);
      });
      return lastRule_func(dom);
    }
  },
  getDomParser: rule => {
    let rules_list = rule.split("@");
    let rule_func = rules_list.map(getFrontRuleParser);
    return page => {
      let dom = XSelector.load(page);
      rule_func.forEach(f => {
        dom = f(dom);
      })
      return dom;
    }
  }
};