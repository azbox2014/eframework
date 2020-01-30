const { JSDOM } = require("jsdom");
const cheerio = require("cheerio");

const getPageJSDOM = pageContent => {
    if (_.isString(pageContent)) {
        return cheerio.load(pageContent);
    }
    return pageContent;
};

const getTextValue = pageContent => {
    //
}

const getTextNodeValue = pageContent => {
    //
}



const isMatch = rule => {
    return /^(id)|^(tag)|^(class)|^(text)|^(href)|^(\<js\>)/i.test(rule);
};

const getValue = (pageContent, rule) => {
    //
};

module.exports = {
    isMatch,
    getValue,
    getPageJSDOM
};