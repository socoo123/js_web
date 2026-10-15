// S01：每次运行前刷新页面；块隔离 let/const，不隔离 var。
{
  let stock = 12;
  const sold = 3;
  stock = stock - sold;
  console.log("binding", stock, sold);

  const product = { stock: 12 };
  product.stock = 9;
  console.log("property", product.stock);
  try {
    product = { stock: 0 };
  } catch (error) {
    console.log("reassign", error.name);
  }
}

{
  console.log("var-before", legacy);
  var legacy = 12;
  if (true) {
    var visibleOutsideIf = legacy;
  }
  console.log("var-block", visibleOutsideIf);
}

try {
  console.log(early);
  let early = 12;
} catch (error) {
  console.log("tdz", error.name);
}

{
  const warehouse = "默认仓";
  {
    const warehouse = "杭州仓";
    const stock = 12;
    console.log("inner", warehouse, stock);
  }
  console.log("outer", warehouse);
}

try {
  const label = "外层";
  {
    console.log(label);
    const label = "内层";
  }
} catch (error) {
  console.log("shadow-tdz", error.name);
}

try {
  console.log(typeof waiting);
  let waiting;
} catch (error) {
  console.log("typeof-tdz", error.name);
}

{
  let pending;
  console.log("initialized", pending);
}
