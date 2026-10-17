const stock = 12;
const stockRef = { current: stock };
const readSnapshot = () => stock;
const readCurrent = () => stockRef.current;
stockRef.current += 3;
console.log(readSnapshot());
console.log(readCurrent());
console.log(stock);
