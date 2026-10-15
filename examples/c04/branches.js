for (const currentStock of [0, 3, 12]) {
  let status;
  if (currentStock === 0) {
    status = "售罄";
  } else if (currentStock <= 5) {
    status = "低库存";
  } else {
    status = "可售";
  }
  console.log(currentStock, status); // → 0 售罄 / 3 低库存 / 12 可售
}
