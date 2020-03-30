const Cheerio = require("cheerio");

module.exports = {
  isMatch: rule => {
    return /^class|^id|^tag|^text/i.test(rule);
  },
  getParse: rule => {
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

    const parse2 = (ppart2, rpart2) => {
      let [r1, r2] = 
    }

    return page => {
    }
  }
};