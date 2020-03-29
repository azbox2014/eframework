const defautAxios = require("axios");

const userAgentSet = {
  pc: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36",
  android: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36",
  mi: "Mozilla/5.0 (Linux; U; Android 9; zh-cn; MI 8 Build/PKQ1.180729.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.141 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.9.2",
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
};

module.exports = (() => {
  let axios = defautAxios.create({
    headers: { 'X-Custom-Header': 'foobar' }
  });

  let axiosUA = userAgentSet.mi;
  axios.setUserAgent = key => {
    axiosUA = userAgentSet[key] ? userAgentSet[key] : userAgentSet.mi;
  };

  let axiosReferer = false;
  axios.setReferer = referer => {
    axiosReferer = referer ? referer : false;
  };


  axios.interceptors.request.use(function (config) {
    config.headers["user-agent"] = axiosUA;
    if (axiosReferer) {
      config.headers["referer"] = axiosReferer;
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    return Promise.reject(error);
  });

  return axios;
})();
