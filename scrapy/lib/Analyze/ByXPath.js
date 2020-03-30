const Selector = require("xselector");

module.exports = {
  isMatch: rule => {
    return /^\/\//.test(rule);
  },
  getParse: rule => {
    return page => {
      const selDom = Selector.load(page);
      return selDom.xpath(rule).value();
    }
  }
};