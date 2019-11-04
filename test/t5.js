const Bot = require("./t4");

setInterval(() => {
  Bot.incr();
}, 1000);

module.exports = {
  getValue: () => {
    return Bot.getCount();
  }
}