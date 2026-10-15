function summarize(quantities) {
  let total = 0;
  let availableCount = 0;
  for (const quantity of quantities) {
    total = total + quantity;
    if (quantity > 0) availableCount++;
  }
  console.log("总库存", total, "有货商品数", availableCount);
}

summarize([12, 0, 7, 3, 25, 5]); // → 总库存 52 有货商品数 5
summarize([]);                  // → 总库存 0 有货商品数 0
summarize([0]);                 // → 总库存 0 有货商品数 0
