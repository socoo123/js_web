const oldItems = [{ id: "P002", stock: 0 }];
const newItems = [...oldItems];
console.log(oldItems === newItems);
console.log(oldItems[0] === newItems[0]);
async function reviewOrder() { console.log("开始"); await Promise.resolve(); console.log("继续"); }
const reviewing = reviewOrder();
console.log("调用方");
await reviewing;
const reviewedStocks = [12, 0, 7];
console.log(reviewedStocks.toSorted((a, b) => a - b));
console.log(reviewedStocks);
