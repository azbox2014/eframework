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
    it => videoList.push(it),
    err => cb.error(cb),
    () => {
      const checkList = () => {
        if(videoList.length === 0) {
          cb.complete();
        } else {
          setTimeout(checkList, 1000);
        }
      }
      checkList();
    }
  )

  const startParse = () => {
    const callback = (vInfo) => {
      if (vInfo) {
        Axios.get(vInfo.url).then(
          res => {
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

  const checkList = () => {
    if (videoList.length > 0) {
      console.log("Start parse m3u8 url...");
      startParse();
    } else {
      setTimeout(checkList, 1000);
    }
  }
  checkList();
});

Rx.Observable.create(cb => {
  let m3u8List = []

  m3u8Url$.subscribe({
    next: it => m3u8List.push(it),
    complete: () => {
      const checkList = () => {
        if (m3u8List.length == 0) {
          cb.complete();
        } else {
          setTimeout(checkList, 1000);
        }
      }
      checkList();
    }
  });

  const startDownload = () => {
    const callback = (err) => {
      if (err) {
        cb.error(err);
      } else {
        let m3u8Info = m3u8List.shift();
        console.log("download " + m3u8Info.title);
        if (m3u8Info) {
          Downloader.download({
            url: m3u8Info.vUrl,
            filePath: Path.resolve(__dirname, "video"),
            filmName: m3u8Info.title,
            callback
          });
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

  const checkList = () => {
    if (m3u8List.length > 0) {
      console.log("Start download video....")
      startDownload();
    } else {
      setTimeout(checkList, 1000);
    }
  };
  checkList();
}).subscribe(console.log);
