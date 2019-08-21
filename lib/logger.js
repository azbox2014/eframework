var log4js = require('log4js');
var util = require('util');

const ISO8601_FORMAT = "yyyy-MM-dd hh:mm:ss.SSS";
const ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ssO";
const DATETIME_FORMAT = "dd MM yyyy hh:mm:ss.SSS";
const ABSOLUTETIME_FORMAT = "hh:mm:ss.SSS";

function padWithZeros(vNumber, width) {
  var numAsString = vNumber + "";
  while (numAsString.length < width) {
    numAsString = "0" + numAsString;
  }
  return numAsString;
}

function addZero(vNumber) {
  return padWithZeros(vNumber, 2);
}

/**
 * Formats the TimeOffest
 * Thanks to http://www.svendtofte.com/code/date_format/
 * @private
 */
function offset(date) {
  // Difference to Greenwich time (GMT) in hours
  var os = Math.abs(date.getTimezoneOffset());
  var h = String(Math.floor(os / 60));
  var m = String(os % 60);
  if (h.length == 1) {
    h = "0" + h;
  }
  if (m.length == 1) {
    m = "0" + m;
  }
  return date.getTimezoneOffset() < 0 ? "+" + h + m : "-" + h + m;
}

let asString = function (/*format,*/ date) {
  var format = ISO8601_FORMAT;
  if (typeof (date) === "string") {
    format = arguments[0];
    date = arguments[1];
  }

  var vDay = addZero(date.getDate());
  var vMonth = addZero(date.getMonth() + 1);
  var vYearLong = addZero(date.getFullYear());
  var vYearShort = addZero(date.getFullYear().toString().substring(2, 4));
  var vYear = (format.indexOf("yyyy") > -1 ? vYearLong : vYearShort);
  var vHour = addZero(date.getHours());
  var vMinute = addZero(date.getMinutes());
  var vSecond = addZero(date.getSeconds());
  var vMillisecond = padWithZeros(date.getMilliseconds(), 3);
  var vTimeZone = offset(date);
  var formatted = format
    .replace(/dd/g, vDay)
    .replace(/MM/g, vMonth)
    .replace(/y{1,4}/g, vYear)
    .replace(/hh/g, vHour)
    .replace(/mm/g, vMinute)
    .replace(/ss/g, vSecond)
    .replace(/SSS/g, vMillisecond)
    .replace(/O/g, vTimeZone);
  return formatted;

};


// date, addr, method, url, HTTP/version, content-length, user-agent
var DEFAULT = "%s %s -- %s %s HTTP/%s, %s %s";
/*
* middleware
*/
module.exports = function (opts) {
  var logger;
  if (!opts) {
    logger = log4js.getLogger();  // 默认使用 console logger
  } else {
    var loggerName = 'normal';
    log4js.configure({
      appenders: [
        {
          type: 'console'
        },
        {
          type: 'file',
          filename: opts.file,
          maxLogSize: opts.size || 10 * 1024 * 1024,
          backups: opts.backups || 4,
          category: loggerName
        }
      ],
      replaceConsole: true
    });
    logger = log4js.getLogger(loggerName);
  }

  return async (ctx, next) => {
    var req = ctx.req, headers = req.headers, nodeReq = ctx.req;
    var str = util.format(DEFAULT, asString(new Date), ctx.ip, req.method, req.url, nodeReq.httpVersion, req.length || null, headers['user-agent']);

    logger.debug(str);
    ctx.logger = logger;
    await next();
  }
}
