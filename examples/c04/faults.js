// E01：故意多循环一次；保留日志让错误产生的第一步可见。
{
  const quantities = [12, 0, 7, 3];
  let total = 0;
  for (let index = 0; index <= quantities.length; index = index + 1) {
    const quantity = quantities[index];
    total = total + quantity;
    console.log("iteration", index, quantity, total);
  }
  console.log("out-of-range", quantities[4]);
  console.log("invalid-total", Number.isNaN(total));
}

// E02：故意在块外使用块内绑定。
try {
  const stock = 0;
  if (stock === 0) {
    const message = "售完";
  }
  console.log(message);
} catch (error) {
  console.log("block-error", error.name);
}

// E03：让调用者处理一个明确的业务异常。
function requireNonNegative(quantity) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError("库存必须是非负整数");
  }
  return quantity;
}

function readStock() {
  return requireNonNegative(-1);
}

try {
  console.log(readStock());
} catch (error) {
  console.log("caught", error.name, error.message);
  console.log(error.stack);
} finally {
  console.log("finally", "本次检查结束");
}
