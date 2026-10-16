const original = Promise.resolve(12);
const next = original.then(stock => stock + 3);
console.log("同一个 Promise", original === next);
next
  .then(stock => console.log("库存", stock))
  .then(value => console.log("下一步", value));
