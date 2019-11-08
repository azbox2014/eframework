const _ = require("lodash");
const Rx = require("rxjs");
const RxOp = require("rxjs/operators");
const Utils = require("../Utils");
const Axios = require("axios");
const Bottleneck = require("bottleneck/es5");

let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36";

class HttpManager {
  constructor() {
    this.limiters = new Bottleneck.Group({
      minTime: 3000,
      maxConcurrent: 1
    });
    this.axios_list = [];
  }

  request({ rule, url, clk }) {
    let self = this;
    httpManager.limiters.key(rule.bookSourceUrl).schedule(() => {
      let axios = self.axios_list[rule.bookSourceUrl];
      if (axios) {
        self.axios_list[rule.bookSourceUrl] = Axios.create({
          baseURL: rule.bookSourceUrl,
          timeout: 2000,
          headers: {
            "User-Agent": _.isEmpty(rule.httpUserAgent) ? userAgent : rule.httpUserAgent
          }
        });
        axios = self.axios_list[rule.bookSourceUrl];
      }
      return new Promise((resolve, reject) => {
        axios
          .get(url)
          .then(res => { clk(null, res); resolve(); })
          .catch(err => { clk(err, null); reject(); });
      });
    });
  }
}

let httpManager = new HttpManager();

module.exports = rule => input$ => Rx.Observable.create(observer => {
  input$.subscribe(url => {
    let times = 50;
    let func = () => {
      httpManager.request({
        rule, url, clk: (err, data) => {
          //
        }
      });
    };
    func();
  });
});