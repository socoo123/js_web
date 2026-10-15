let firstAvailable = null;
for (const quantity of [0, 7, 3]) { // P002–P004 的库存
  if (quantity === 0) continue;
  firstAvailable = quantity;
  break;
}
console.log(firstAvailable); // → 7
