let count = 0;
for (const quantity of [12, 0, 7]) {
  if (quantity === 0) continue;
  count++;
}
console.log(count);
const zone = "默认仓";
{
  const zone = "杭州仓";
  console.log(zone);
}
console.log(zone);
console.log([12, 0, 7][3]);
