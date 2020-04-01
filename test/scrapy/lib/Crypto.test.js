const Crypto = require("../../../scrapy/lib/Crypto");

it('测试加密解密', () => {
  let data = '你好德法尔范';
  let enStr = Crypto.encode(data);
  console.log(enStr);
  let deStr = Crypto.decode(enStr);
  expect(deStr).toEqual(data);
});
