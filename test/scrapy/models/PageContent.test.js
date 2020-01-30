const PageContent = require("../../../scrapy/models/PageContent");

describe('页面内容结构测试', () => {
    let ctx = {}
    let pageContent = null;

    it.skip('测试创建对象', () => {
        expect(pageContent.getHtml()).toEqual(ctx.html);
    });

    it.skip('测试ChDom', () => {
        let $ = pageContent.getCHDOM();
        // console.log(pageContent.getCHDOM());
        expect($("title").text()).toEqual("test1");
    });

    it.skip('测试xpath', () => {
        const xpath = require('xpath');
        let xpdom = pageContent.getXPath();
        // console.log(xpdom);
        let ulnode = xpath.select("//body/ul", xpdom);
        let orange_linode = xpath.select("//li[2]/text()", xpdom);
        // console.log(xpath.select("string(//title)", xpdom));
        // console.log(xpath.select("//title/text()", xpdom)[0].data);
        // console.log(orange_linode[0].nodeValue);
        expect(orange_linode[0].nodeValue).toEqual("Orange");
    });

    it.skip('测试XsDom', () => {
        let xsdom = pageContent.getXsDom();
        expect(xsdom.xpath("//body/ul/li[2]/text()").value()).toEqual("Orange")
        expect(xsdom.css(".pear").attr("class")).toEqual("pear");
    });

    beforeEach(() => {
        pageContent = new PageContent({ html: ctx.html });
    });

    afterEach(() => {
        pageContent = null;
    });

    beforeAll(() => {
        ctx.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>test1</title>
        </head>
        <body>
            <ul id="fruits">
                <li class="apple">Apple</li>
                <li class="orange">Orange</li>
                <li class="pear">Pear</li>
            </ul>
        </body>
        </html>
        `;
    });
});