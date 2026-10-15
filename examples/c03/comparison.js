console.log(3 === "3", 3 == "3");
console.log(0 == false, "" == 0);
console.log(null === undefined, null == undefined);
console.log(null == 0);
console.log(NaN === NaN, Object.is(NaN, NaN));
console.log(0 === -0, Object.is(0, -0));
console.log(1n === 1, 1n == 1);

const firstProduct = { name: "键盘" };
const sameProduct = firstProduct;
const anotherProduct = { name: "键盘" };
console.log(firstProduct === sameProduct);
console.log(firstProduct === anotherProduct);
console.log(Object.is(firstProduct, anotherProduct));
console.log("键盘" === "键盘");
