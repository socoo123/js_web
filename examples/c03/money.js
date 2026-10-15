// P002 无线鼠标：单价 129.00 元，存成整数 12900 分
const priceCents = 12900;

console.log(129 * 0.9);                    // → 116.10000000000001（按元算九折）
console.log(Math.round(priceCents * 0.9)); // → 11610（按分算，再取整）

const totalCents = priceCents * 3;
const label = (totalCents / 100).toFixed(2);
console.log(totalCents);   // → 38700
console.log(label);        // → 387.00
console.log(typeof label); // → string
