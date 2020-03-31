const Cheerio = require("cheerio");

module.exports = {
  isMatch: rule => {
    return /^class|^id|^tag|^text/i.test(rule);
  },
  getParse: rule => {
    const parse0 = rule0 => {
      
    }

    const parse1 = rule1 => {
      let [r1, r2, r3] = rule1.split('.');
      let cssSelect = "";
      if (/^id$/i.test(r1)) {
        cssSelect = "#" + r2;
      } else if (/^class$/i.test(r1)) {
        cssSelect = "." + r2;
        if (/^\d+$/.test(r3)) {
          cssSelect += ":nth-child(" + r3 + ")";
        }
      } else if (/^tag$/i.test(r1)) {
        cssSelect = r2;
        if (/^\d+$/.test(r3)) {
          cssSelect += ":nth-child(" + r3 + ")";
        }
      }
      return cssSelect;
    }

    const parse2 = rule2 => {
      let ruleList = rule2.split("@");
      let cssSelect = false;
      let lastRule = false;
      if (ruleList.length > 1) {
        lastRule = ruleList.pop();
        cssSelect = ruleList
          .map(r => {
            return parse1(r);
          })
          .join(" ");
      } else {
        lastRule = rule2;
      }
      return [cssSelect, parse0(lastRule)];
    }

    let [cssSelector, lastRule] = parse2(rule);

    return page => {
      let dom = Cheerio.load(page);
      if (cssSelector) {
        dom = dom(cssSelector);
      }
      if (/^tag$/i.test(lastRule)) {

      }
    }
  }
};