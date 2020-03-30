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
    cb.next(false);
    cb.complete();
  }).catch(err => cb.error(err));
});

let m3u8Url$ = Rx.Observable.create(cb => {
  let videoList = [];
  let allCount = 0;
  let doneCount = 0;
  let isFinish = false;

  videoList$.subscribe(
    it => {
      if (it) {
        videoList.push(it);
        allCount++;
      } else {
        cb.next(false);
        isFinish = true;
      }
    },
    err => cb.error(cb)
  )

  const startParse = () => {
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
        checkList();
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
      if ((allCount > doneCount) || !isFinish) {
        setTimeout(checkList, 1000);
      } else {
        cb.complete();
      }
    }
  }
  checkList();
});

Rx.Observable.create(cb => {
  let m3u8List = [];
  let allCount = 0;
  let doneCount = 0;
  let isFinish = false;

  m3u8Url$.subscribe(it => {
    if (it) {
      m3u8List.push(it);
      allCount++;
    } else {
      cb.next(false);
      isFinish = true;
      if (doneCount === allCount) {
        cb.complete();
      }
    }
  }, cb.error);

  const startDownload = () => {
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
          checkList();
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
      console.log("Start download video....");
      startDownload();
    } else {
      if ((allCount > doneCount) || !isFinish) {
        setTimeout(checkList, 500);
      } else {
        cb.complete();
      }
    }
  };
  checkList();
}).subscribe(console.log);
