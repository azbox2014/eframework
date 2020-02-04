class UtilsFunc {
    static getHost(url) {
        let result = /https?:\/\/([^\/]+)\//.exec(url);
        return result && result.length == 2 ? result[1] : false;
    }

    static analyzeRule(rule) {
        let fragments = rule.split(/@/);
        let selector = "";
        let frag = fragments.shift();

        while (fragments.length > 0) {
            // 验证每一个规则片段是否有效
            if (!/^(\d+\.)+\d+/i.test(frag)) return [false, "\"" + rule + "\" isn't valid.(" + frag + ")"];

            let parts = frag.split(/\./);
            if (/^id/i.test(parts[0])) {
                selector += "#" + parts[1];
            } else if (/^class/i.test(parts[0])) {
                selector += "." + parts[1];
            } else if (/^tag/i.test(parts[0]) {
                selector += parts[1];
            } else {
                return [false, "\"" + rule + "\" isn't valid.(" + frag + ")"];
            }
            if (parts.length == 3) {
                let part3 = parts[2];
                if (/^\d/i.test(part3)) {
                    //
                }
            }
        }
        if (fragments.length > 1) {
            //
        }
        if (/(^a)/.test(rule)) {

        }
    }
}

module.exports = UtilsFunc;