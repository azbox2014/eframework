const path = require("path");

const prod = {
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'azbox',
    password: 'Rpi@123',
    database: 'NovelDB',
    charset: 'utf8'
  }
};

const dev = {
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, "..", "db.sqlite")
  },
  useNullAsDefault: true
}

let dbConfig = null;
if(process.env.NODE_ENV === "dev") {
  dbConfig = dev;
} else {
  dbConfig = prod;
}

module.exports = dbConfig;