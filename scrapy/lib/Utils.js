class UtilsFunc {
  static getHost(url) {
    let result = /https?:\/\/([^\/]+)\//.exec(url);
    return result && result.length == 2 ? result[1] : false;
  }
}

module.exports = Utils;