const previous = { productId: "P001" };
const current = { productId: "P001" };
console.log(Object.is(previous.productId, current.productId));
console.log(Object.is(previous, current));
console.log(Object.is(() => 12, () => 12));
console.log(Object.is(["P001"], ["P001"]));
