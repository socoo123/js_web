console.log(5 / 2);
console.log(5n / 2n);
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(typeof NaN, Number.isNaN(NaN));
console.log(1 / 0, Number.isFinite(1 / 0));
console.log(Number.isInteger(3.0));
console.log(Number.MAX_SAFE_INTEGER);
console.log(Number.isSafeInteger(9007199254740992));
console.log(9007199254740992 === 9007199254740993);
console.log(9007199254740992n + 1n);

// 金额以整数分保存；当前输入与乘积都在安全整数范围。
const unitPriceCents = 1990;
const soldQuantity = 3;
const totalCents = unitPriceCents * soldQuantity;
console.log(totalCents, Number.isSafeInteger(totalCents));
console.log((totalCents / 100).toFixed(2));
