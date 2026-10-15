console.log(Number.MAX_SAFE_INTEGER); // → 9007199254740991
console.log(2 ** 53 === 2 ** 53 + 1); // → true，相邻整数已经分不开

const order = JSON.parse('{"orderId": 1234567890123456789}');
console.log(order.orderId);                       // → 1234567890123456800
console.log(Number.isSafeInteger(order.orderId)); // → false

console.log(1234567890123456789n + 1n); // → 1234567890123456790n
try {
  console.log(1n + 1);
} catch (error) {
  console.log(error.name); // → TypeError，BigInt 不能和 Number 混算
}
