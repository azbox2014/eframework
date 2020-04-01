const _ = require("lodash");
const CryptoJS = require("crypto-js");

const KEY_LEN = 15;
let SEED = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
SEED += _.toLower(SEED);
SEED += "+/";
const RAND_MAX = SEED.length - 1;
let SEED_LIST = _.range(0, KEY_LEN);

const Utils = {
  wrapData: (data, key) => {
    return [data, key].join("");
  },
  parseData: data => {
    let pos = data.length - KEY_LEN;
    return [data.substr(0, pos), data.substr(pos)];
  },
  getKey: () => {
    return _(SEED_LIST)
      .map(() => _.random(RAND_MAX))
      .map(id => SEED[id])
      .value()
      .join('');
  }
};

module.exports = {
  decode: str => {
    let [data, key] = Utils.parseData(str);
    let bytes = CryptoJS.AES.decrypt(data, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
  encode: str => {
    let key = Utils.getKey();
    let data = CryptoJS.AES.encrypt(str, key).toString();
    return Utils.wrapData(data, key);
  }
}