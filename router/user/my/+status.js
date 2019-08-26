module.exports.get = async ({res}) => {
  console.log(res.req);
  res.send("hello_my");
}