const axios = require("axios");

module.exports = ({ logger }) => {

  let _axios = axios.create({
    headers: { 'X-Custom-Header': 'foobar' }
  });

  _axios.interceptors.request.use(function (config) {
    logger.info({ config });
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  _axios.interceptors.response.use(function (response) {
    // logger.info(response);
    return response;
  }, function (error) {
    return Promise.reject(error);
  });

  return _axios;
}
