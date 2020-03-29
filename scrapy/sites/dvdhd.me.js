const _ = require("lodash");
const Selector = require("xselector");
const Axios = require("../axios");
const Rx = require("rxjs");
const RxOp = require("rxjs/operators");
const Url = require("url");

const baseUrl = "https://dvdhd.me/detail/index7013.html"

let videoList$ = Rx.Observable.create(cb => {
  Axios.get(baseUrl).then(res => {
    let selDom = Selector.load(res.data);
    _.map(selDom.css("#video_list_li a").values(), el_str => {
      let el = Selector.load(el_str);
      cb.next({
        title: el.text(),
        url: Url.resolve(baseUrl, el.attr("href"))
      });
    });
    cb.complete();
  }).catch(err => cb.error(err));
});

Rx.Observable.create(cb => {
  let videoList = []
  videoList$.subscribe({
    next: it => videoList.push(it),
    complete: () => {
      
    }
  });
})
