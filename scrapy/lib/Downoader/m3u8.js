const PinYin = require("pinyin");
const Rm = require("rimraf");
const Axios = require('../axios');
const _ = require("lodash");
const fs = require('fs');
const URL = require('url');
const md5 = require('md5');
const { exec } = require('child_process');
const path = require('path');

const Utils = {
  log(str) {
    console.log(Date.now(), str);
  },

  logError(str) {
    console.error(Date.now(), str);
  },

  exit() {
    throw new Error('exit');
  }
}

class m3u8Downloader {
  constructor() {
    this.maxPN = 15;
    this.processNum = 15;
    this.tsCount = 0;
    this.tsList = [];
    this.tsOutPuts = [];
    this.downloadedNum = 0;
    this.url = '';
    this.dir = '';
    this.filmName = 'result';
    this.preCount = 17;
    this.sufCount = 16;
    Axios.setUserAgent("pc");
  }

  download(opts) {
    let {
      maxPN,
      processNum,
      tsCount,
      tsList,
      tsOutPuts,
      downloadedNum,
      url,
      dir,
      preCount,
      sufCount,
      filmName
    } = this;

    let mp4Num = 0;
    let mp4DoneNum = 0;
    let toConcat = [];

    function exit(err) {
      Utils.exit();
      opts.callback(err);
    }

    function parseM3U8(content) {
      Utils.log('starting parsing m3u8 file');
      tsList = content.match(/((http|https):\/\/.*)|(.+\.ts)/g);
      if (!tsList) {
        Utils.logError('m3u8 file error');
        Utils.log(content);
        return;
      }
      tsCount = tsList.length;
      tsOutPuts = [];
      const urlObj = URL.parse(url);
      const host = `${urlObj.protocol}//${urlObj.host}`;
      const urlPath = url.substr(0, url.lastIndexOf('/') + 1);

      for (let i = 0; i < tsCount; i++) {
        if (tsList[i].indexOf('http') < 0) {
          if (tsList[i].indexOf('/') === 0) {
            tsList[i] = host + tsList[i];
          } else {
            tsList[i] = urlPath + tsList[i];
          }
        }
        const tsOut = path.join(dir, `${i}.ts`);
        tsList[i] = {
          index: i,
          url: tsList[i],
          file: tsOut
        };
        tsOutPuts.push(tsOut);
      }
      if (tsCount > 0) {
        processNum = tsCount > maxPN ? maxPN : tsCount;
      }
      batchDownload();
    }

    function batchDownload() {
      let doneList = [];
      let undoList = _.range(preCount, tsCount - sufCount);
      let allList = _.range(preCount, tsCount - sufCount);
      let downCount = tsCount - preCount - sufCount;
      let isConvert = false;

      const checkAllDone = () => {
        if ((downCount - (doneList.length + undoList.length)) === 0) {
          if (!isConvert) {
            isConvert = true;
            convertTS();
          }
        } else {
          setTimeout(checkAllDone, 500);
        }
      }

      const runingMachine = (id = -1, isDo = true) => {
        Utils.log("download ts -> doing task: " + JSON.stringify(_.without(allList, ..._.concat(undoList, doneList))));
        if (id >= 0) {
          isDo ? doneList.push(id) : undoList.push(id);
        }
        let doId = undoList.shift();
        doId >= 0 ? downloadTs(doId, runingMachine) : checkAllDone();
      }
      for (let i = 0; i < processNum; i++) {
        runingMachine();
      }
    }

    function downloadTs(index, callback) {
      const tsObj = tsList[index];
      Utils.log(`start download ts${tsObj.index}`);
      if (fs.existsSync(tsObj.file)) {
        downloadedNum++;
        Utils.log("download ts" + tsObj.index + " sucess,downloaded " + downloadedNum + ", remain: " + (tsCount - downloadedNum));
        callback(index);
      } else {
        Axios
          .get(tsObj.url, { responseType: "arraybuffer", timeout: 10000 })
          .then(res => {
            if (res.status === 200) {
              fs.writeFile(tsObj.file, res.data, (error2) => {
                if (error2) {
                  Utils.logError("download failed ts" + tsObj.index + ", error:" + error2.message);
                  callback(index, false);
                } else {
                  downloadedNum++;
                  Utils.log("download ts" + tsObj.index + " sucess,downloaded " + downloadedNum + ", remain: " + (tsCount - downloadedNum));
                  callback(index);
                }
              });
            }
          }, error => {
            Utils.logError("download failed ts" + tsObj.index + ",error:" + error.message);
            callback(index, false);
          });
      }
    }

    function convertTS() {
      toConcat = _.chunk(_.slice(tsOutPuts, preCount, tsCount - sufCount), 100);
      Utils.log('concat ts to mp4');
      mp4Num = toConcat.length;

      let doneList = [];
      let undoList = _.range(0, mp4Num);
      let allList = _.range(0, mp4Num);
      let unFinish = true;

      const checkAllDone = () => {
        if (unFinish && (mp4Num === (doneList.length + undoList.length))) {
          unFinish = false;
          concatMP4();
        } else {
          setTimeout(checkAllDone, 100);
        }
      }

      const runingMachine = (id = -1, isDone = false) => {
        Utils.log("convert ts -> doing task: " + JSON.stringify(_.without(allList, ..._.concat(undoList, doneList))));
        if (id >= 0) {
          if (isDone) doneList.push(id);
          else undoList.push(id);
        }
        let doId = undoList.shift();
        doId >= 0 ? doConvert(doId, runingMachine) : checkAllDone();
      }

      runingMachine();
      runingMachine();
    }

    function doConvert(index, callback) {
      const outPutMP4 = path.join(dir, "output" + index + ".mp4");
      const strConcat = toConcat[index].join('|');
      if (strConcat !== '') {
        if (fs.existsSync(outPutMP4)) {
          fs.unlinkSync(outPutMP4);
        }
        const cmd = `ffmpeg -i "concat:${strConcat}" -acodec copy -vcodec copy -absf aac_adtstoasc ${outPutMP4}`;
        exec(cmd, (error) => {
          if (error) {
            Utils.logError(`ffmpeg mp4 ${index} error: ${error.message}`);
            callback(index);
          } else {
            Utils.log(`ffmpeg mp4 ${index} success`);
            callback(index, true);
          }
        });
      }
    }

    function concatMP4() {
      const lastMP4 = path.join(dir, filmName + ".mp4");
      if (mp4Num >= 1) {
        let filelist = [];
        for (let i = 0; i < mp4Num; i++) {
          filelist.push("file '" + path.join(dir, `output${i}.mp4`) + "'");
        }
        let filePath = path.join(dir, "filelist.txt");
        fs.writeFileSync(filePath, filelist.join("\n"));
        const cmd = `ffmpeg -safe 0 -f concat -i ${filePath} -y -c copy ${lastMP4}`;
        exec(cmd, (error) => {
          if (error) {
            Utils.logError(`ffmpeg mp4ALL error: ${error.message}`);
            exit(error);
          } else {
            Utils.log('ffmpeg mp4ALL success');
            deleteTS();
          }
        });
      } else {
        fs.rename(path.join(dir, 'output0.mp4'), lastMP4, (err) => {
          if (err) {
            Utils.logError(`rename last mp4 error: ${err.message}`);
            exit(err);
          }
          deleteTS();
        });
      }
    }

    function deleteTS() {
      try {
        // Rm.sync(path.join(dir, "*.ts"));
        // Rm.sync(path.join(dir, "output*.mp4"));
        // Rm.sync(path.join(dir, "filelist.txt"));
        Utils.log('@@@success@@@');
        opts.callback();
      } catch (error) {
        exit(error);
      }
    }

    maxPN = opts.processNum || maxPN;
    url = opts.url;
    if (opts.filmName) {
      filmName = PinYin(opts.filmName, { style: PinYin.STYLE_TONE2 }).flat().join("");
      dir = path.join(opts.filePath, filmName);
    } else {
      dir = path.join(opts.filePath, md5(url));
    }

    if (fs.existsSync(path.join(dir, filmName + ".mp4"))) {
      Utils.log('@@@success@@@');
      opts.callback();
    } else {

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      Axios.get(url).then(res => {
        parseM3U8(res.data);
      }, err => {
        if (err) {
          Utils.logError(`problem with request: ${err.message}`);
          opts.callback(err);
        }
      });
    }
  }
}

module.exports = m3u8Downloader;