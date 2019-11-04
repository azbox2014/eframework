const Bottleneck = require("bottleneck/es5");

let limiters = new Bottleneck.Group({
  minTime: 3000,
  maxConcurrent: 1
});

console.log("start: ",new Date());
limiters.key("k1").schedule(() => {
  console.log("sk1: ",new Date());
  return new Promise(resolve => {
    setTimeout(()=>{
      console.log("ek1: ",new Date());
      resolve();
    }, 4000)
  });
});
limiters.key("k1").schedule(() => {
  console.log("sk1: ",new Date());
  return new Promise(resolve => {
    setTimeout(()=>{
      console.log("ek1: ",new Date());
      resolve();
    }, 4000)
  });
});
limiters.key("k1").schedule(() => {
  console.log("sk1: ",new Date());
  return new Promise(resolve => {
    setTimeout(()=>{
      console.log("ek1: ",new Date());
      resolve();
    }, 4000)
  });
});

