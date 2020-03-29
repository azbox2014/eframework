const Axios = require('../axios');
const _ = require("lodash");
const fs = require('fs');
const URL = require('url');
const md5 = require('md5');
const { exec } = require('child_process');
const path = require('path');

const Utils = {
  log(str) {
    console.log(str);
  },

  logError(str) {
    console.error(str);
  },

  exit() {
    throw new Error('exit');
  },

  arrayChunk(arr, num) {
    let c = arr.length / num;
    if (arr.length % num > 0) {
      c++;
    }
    const result = [];
    for (let i = 0; i < c; i++) {
      const a = arr.splice(0, num);
      if (a.length > 0) {
        result.push(a);
      }
    }
    return result;
  }
}

class m3u8Downloader {
  constructor() {
    this.maxPN = 15;
    this.processNum = 0;
    this.tsCount = 0;
    this.tsList = [];
    this.tsOutPuts = [];
    this.downloadedNum = 0;
    this.url = '';
    this.dir = '';
    this.filmName = 'result';
    Axios.setUserAgent("pc");
  }

  download(opts) {
    let { maxPN,
      processNum,
      tsCount,
      tsList,
      tsOutPuts,
      downloadedNum,
      url,
      dir,
      filmName
    } = this;

    let mp4Num = 0;
    let mp4DoneNum = 0;
    let toConcat = [];

    function exit(err) {
      Utils.exit();
      opts.callback(err);
    }

    function parseM3U8(content, callback) {
      Utils.log('starting parsing m3u8 file');
      tsList = content.match(/((http|https):\/\/.*)|(.+\.ts)/g);
      if (!tsList) {
        Utils.logError('m3u8 file error');
        Utils.log(content);
        return;
      }
      tsCount = tsList.length;
      if (tsCount > 0) {
        processNum = tsCount > maxPN ? maxPN : tsCount;
      }
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
        const tsOut = `${dir}/${i}.ts`;
        tsList[i] = {
          index: i,
          url: tsList[i],
          file: tsOut
        };
        tsOutPuts.push(tsOut);
      }
      batchDownload(callback);
    }

    function batchDownload(callback) {
      for (let i = 0; i < processNum; i++) {
        downloadTs(i);
      }
    }

    function downloadTs(index) {
      if (index >= tsCount) {
        return;
      }
      const tsObj = tsList[index];
      Utils.log(`start download ts${tsObj.index}`);
      Axios.get(tsObj.url, { timeout: 100000 }).then(res => {
        if (res.status === 200) {
          fs.writeFile(tsObj.file, buff, (error2) => {
            if (error2) {
              Utils.logError(`download failed ts${tsObj.index} error:${error2.message}`);
              downloadTs(index);
            } else {
              downloadedNum++;
              Utils.log(`download ts${tsObj.index} sucess,downloaded ${downloadedNum}/remain${tsCount - downloadedNum}`);
              checkIfDone();
              downloadTs(index + processNum);
            }
          });
        }
      }, err => {
        Utils.logError(`download failed ts${tsObj.index}error:${error.message}`);
        downloadTs(index);
      });
    }

    function checkIfDone() {
      if (downloadedNum === tsCount) {
        convertTS();
      }
    }

    function convertTS() {
      toConcat = Utils.arrayChunk(tsOutPuts, 100);
      Utils.log('concat ts to mp4');
      mp4Num = toConcat.length;
      doConvert(0);
    }

    function doConvert(index) {
      if (mp4Num === mp4DoneNum) {
        concatMP4();
      } else {
        const outPutMP4 = `${dir}/output${index}.mp4`;
        const strConcat = toConcat[index].join('|');
        if (strConcat !== '') {
          if (fs.existsSync(outPutMP4)) {
            fs.unlinkSync(outPutMP4);
          }
          const cmd = `ffmpeg -i "concat:${strConcat}" -acodec copy -vcodec copy -absf aac_adtstoasc ${outPutMP4}`;
          exec(cmd, (error) => {
            if (error) {
              Utils.logError(`ffmpeg mp4 ${index} error: ${error.message}`);
              doConvert(index);
            }
            Utils.log(`ffmpeg mp4 ${index} success`);
            mp4DoneNum++;
            doConvert(index + 1);
          });
        }
      }
    }

    function concatMP4() {
      const lastMP4 = `${dir}/${filmName}.mp4`;
      if (mp4Num > 1) {
        let filelist = '';
        for (let i = 0; i < mp4Num; i++) {
          filelist += `file output${i}.mp4 \n`;
        }
        const filePath = path.join(dir, 'filelist.txt');
        fs.writeFileSync(filePath, filelist);
        const cmd = `ffmpeg -f concat -i ${filePath} -c copy ${lastMP4}`;
        exec(cmd, (error) => {
          if (error) {
            Utils.logError(`ffmpeg mp4ALL error: ${error.message}`);
            exit(error);
          }
          Utils.log('ffmpeg mp4ALL success');
          deleteTS();
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
      const cmd = `rm -rf ${dir}/*.ts ${dir}/output*.mp4 ${dir}/filelist.txt`;
      exec(cmd, (error) => {
        if (error) {
          Utils.logError(`delete ts error: ${error.message}`);
          exit(error);
        }
        Utils.log('@@@success@@@');
        opts.callback();
      });
    }

    maxPN = opts.processNum || maxPN;
    url = opts.url;
    if (opts.filmName) {
      filmName = opts.filmName;
      dir = path.join(opts.filePath, filmName);
    } else {
      dir = path.join(opts.filePath, md5(url));
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    Axios.get(url).then(res => {
      console.log(_.keys(res));
      // parseM3U8(res.data.body);
    }, err => {
      if (err) {
        Utils.logError(`problem with request: ${err.message}`);
        opts.callback(err);
      }
    });
  }
}

module.exports = m3u8Downloader;