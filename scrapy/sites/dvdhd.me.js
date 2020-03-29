const _ = require("lodash");
const Selector = require("xselector");
const Axios = require("../lib/axios");
const Rx = require("rxjs");
const RxOp = require("rxjs/operators");
const Url = require("url");

const M3u8Downloader = require("../lib/Downoader/m3u8");
const Downloader = new M3u8Downloader();

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
      const callback = (err) => {
        if (err) {
          cb.error(err);
        } else {
          let videoInfo = videoList.shift();
          if (videoInfo) {
            Downloader.download({
              url: videoInfo.url,
              filmName: videoInfo.title,
              callback
            });
          } else {
            cb.complete();
          }
        }
      }
      let videoInfo = videoList.shift();
      Downloader.download({
        url: videoInfo.url,
        filmName: videoInfo.title,
        callback
      })
    }
  });
}).subscribe(console.log);
