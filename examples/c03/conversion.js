console.log(12 + "3"); // → 123，字符串拼接
console.log(12 - "3"); // → 9，减法只做数学运算，"3" 先被转成数字

console.log(Number("3"));   // → 3
console.log(Number(" 3 ")); // → 3，忽略首尾空白
console.log(Number("3.8")); // → 3.8
console.log(Number("3件")); // → NaN
console.log(Number(""));    // → 0，空输入变成了 0

console.log(Number.parseInt("3件", 10)); // → 3，只读开头的数字
console.log(Number.parseInt("3.8", 10)); // → 3，小数被丢掉
