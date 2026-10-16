const count = 100_000;
const shifted = Array.from({ length: count }, (_, index) => index);
const indexed = [...shifted];
let shiftSum = 0;
let headSum = 0;
console.time("shift");
while (shifted.length > 0) shiftSum += shifted.shift();
console.timeEnd("shift");
console.time("head");
for (let head = 0; head < indexed.length; head++) headSum += indexed[head];
console.timeEnd("head");
console.log(shiftSum, headSum); // → 4999950000 4999950000
