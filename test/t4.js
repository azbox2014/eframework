let count = 1;

module.exports = {
  incr: () => {
    count++;
  },
  setCount: num => {
    count = num;
  },
  getCount: () => {
    return count;
  }
};