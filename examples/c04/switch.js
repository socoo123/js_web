const action = "restock";
switch (action) {
  case "sell": {
    const message = "执行售出";
    console.log(message);
    break;
  }
  case "restock": {
    const message = "执行补货";
    console.log(message); // → 执行补货
    break;
  }
  default: {
    console.log("未知操作");
  }
}
