const Axios = require("axios");
const Bottleneck = require("bottleneck/es5");

class HttpManager {
  constructor() {
    this.limiters = new Bottleneck.Group({
      minTime: 3000,
      maxConcurrent: 1
    });
  }
}

module.exports = rule => {
  //
}