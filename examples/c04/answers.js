// A01：将 total 放在循环外，用 let；边界改为 <。
{
  const quantities = [12, 0, 7, 3];
  let total = 0;
  for (let index = 0; index < quantities.length; index = index + 1) {
    const quantity = quantities[index];
    total = total + quantity;
  }
  console.log("fixed-total", total);
}

// A02：在分支前建立要共享的绑定，两条路径都赋值。
{
  for (const stock of [0, 3]) {
    let message;
    if (stock === 0) {
      message = "售完";
    } else {
      message = "可售";
    }
    console.log("fixed-message", stock, message);
  }
}

// A03：每轮绑定 quantity，但不重新给它赋值；累计量需要 let。
{
  let availableTotal = 0;
  for (const quantity of [12, 0, 7, 3]) {
    if (quantity === 0) {
      continue;
    }
    availableTotal = availableTotal + quantity;
  }
  console.log("available-total", availableTotal);
}
