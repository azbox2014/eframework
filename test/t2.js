const m1 = async () => {
  // let a = await new Promise(resolve => {
  //   setTimeout(() => { resolve(2); }, 1000);
  // });
  let a = 3;
  return a;
}

async function main() {
  return await m1();
};

setTimeout(() => {
  console.log(main());
}, 0);