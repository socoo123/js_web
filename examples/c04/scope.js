const warehouse = "默认仓";
{
  const warehouse = "杭州仓";
  const quantity = 12;
  {
    console.log(warehouse, quantity); // → 杭州仓 12
  }
}
console.log(warehouse); // → 默认仓
