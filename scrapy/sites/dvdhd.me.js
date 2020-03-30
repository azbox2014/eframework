const _ = require("lodash");
const Selector = require("xselector");
const Axios = require("../lib/axios");
const Rx = require("rxjs");
const RxOp = require("rxjs/operators");
const Path = require("path");
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
        url: Url.resolve(baseUrl, el.xpath("/a/@href").value())
      });
    });
    cb.complete();
  }).catch(err => cb.error(err));
});

let m3u8Url$ = Rx.Observable.create(cb => {
  let videoList = [];
  videoList$.subscribe(
    it => {
      videoList.push(it);
    },
    err => cb.error(cb),
    () => {
      startParse();
    }
  )

  const startParse = () => {
    console.log("Start parse m3u8 url...");
    const callback = (vInfo) => {
      if (vInfo) {
        Axios.get(vInfo.url).then(
          res => {
            doneCount++;
            let selDom = Selector.load(res.data);
            cb.next({ ...vInfo, vUrl: selDom.regexp(/var url = "([^"]*)";/) });
            console.log(vInfo.title + " m3u8 url complete.");
            let _vInfo = videoList.shift();
            callback(_vInfo);
          },
          aerr => {
            console.log("Request " + vInfo.title + " m3u8 failed");
            videoList.push(vInfo);
          }
        ).catch(cb.error);
      } else {
        cb.complete();
      }
    };

    let videoInfo = videoList.shift();
    callback(videoInfo);
  }
});

Rx.Observable.create(cb => {
  let m3u8List = [];
  m3u8Url$.subscribe(
    it => {
      m3u8List.push(it);
    },
    cb.error,
    () => {
      startDownload();
    }
  );

  const startDownload = () => {
    console.log("Start download video....");
    const callback = (err) => {
      doneCount++;
      if (err) {
        cb.error(err);
      } else {
        let m3u8Info = m3u8List.shift();
        if (m3u8Info) {
          console.log("download " + m3u8Info.title);
          Downloader.download({
            url: m3u8Info.vUrl,
            filePath: Path.resolve(__dirname, "video"),
            filmName: m3u8Info.title,
            callback
          });
        } else {
          cb.complete();
        }
      }
    }
    let m3u8Info = m3u8List.shift();
    console.log("download " + m3u8Info.title);
    Downloader.download({
      url: m3u8Info.vUrl,
      filePath: Path.resolve(__dirname, "video"),
      filmName: m3u8Info.title,
      callback
    })
  };
}).subscribe(console.log);
