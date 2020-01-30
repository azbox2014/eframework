const _ = require("lodash");
const { JSDOM } = require("jsdom");
const Cheerio = require("cheerio");
const xSelector = require('xselector');
const { DOMParser, XMLSerializer } = require("xmldom");

module.exports = function() {
    let self = this;
    let that = {};
    _.extend(that, {
        html: false,
        chdom: false,
        jsdom: false,
        xpath: false,
        xsdom: false,
        json: false
    }, arguments.length > 0 ? arguments[0] : undefined);

    const transform = () => {
        if (!that.html) {
            if (that.chdom) that.html = that.chdom.xml();
            else if (that.jsdom) that.html = that.jsdom.outerHTML;
            else if (that.xpath) that.html = new XMLSerializer().serializeToString(that.xpath);
            else that.html = "";
        }
    };

    self.getHtml = () => {
        if (!that.html) {
            transform();
        }
        return that.html;
    }

    self.getCHDOM = () => {
        if (!that.chdom) {
            if (!that.html) transform();
            that.chdom = Cheerio.load(that.html);
        }
        return that.chdom;
    };

    self.getJSDOM = () => {
        if (!that.jsdom) {
            if (!that.html) transform();
            that.jsdom = new JSDOM(
                that.html,
                {
                    runScripts: "dangerously",
                    // resources: "usable",
                }
            );
        }
        return that.jsdom;
    }

    self.getXPath = () => {
        if (!that.xpath) {
            if (!that.html) transform();
            that.xpath = new DOMParser().parseFromString(that.html);
        }
        return that.xpath;
    }

    self.getXsDom = () => {
        if (!that.xsdom) {
            if (!that.html) transform();
            that.xsdom = xSelector.load(that.html);
        }
        return that.xsdom;
    }

    self.getJSON = () => {
        return _.cloneDeep(that.json);
    }
}