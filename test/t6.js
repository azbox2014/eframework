const Bot = require("./t4");
const View = require("./t5");


setInterval(() => {
  console.log("Bot: ", Bot.getCount());
  console.log("View:", View.getValue());
}, 3000);