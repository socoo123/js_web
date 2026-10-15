// S02：条件与循环；每块可以单独复制到 Console。
{
  const stock = 0;
  if (stock === 0) {
    console.log("if", "售完");
  } else if (stock < 5) {
    console.log("if", "库存偏低");
  } else {
    console.log("if", "可售");
  }

  const action = "restock";
  let message;
  switch (action) {
    case "sell": {
      message = "执行售出";
      break;
    }
    case "restock": {
      message = "执行补货";
      break;
    }
    default: {
      message = "未知操作";
    }
  }
  console.log("switch", message);

  switch ("0") {
    case 0:
      console.log("case-number");
      break;
    default:
      console.log("case-default");
  }
}

{
  const quantities = [12, 0, 7];
  for (const quantity of quantities) {
    console.log("of", quantity);
  }
  for (const key in quantities) {
    console.log("in", key, typeof key);
  }

  let attempts = 0;
  while (attempts < 2) {
    attempts = attempts + 1;
  }
  console.log("while", attempts);

  let checks = 0;
  do {
    checks = checks + 1;
  } while (false);
  console.log("do", checks);

  let firstAvailable = 0;
  for (const quantity of [0, 7, 3]) {
    if (quantity === 0) {
      continue;
    }
    firstAvailable = quantity;
    break;
  }
  console.log("first", firstAvailable);
}
