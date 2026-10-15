{
  const original = { id: "KB-001", stock: 12, warehouse: { city: "上海" } };
  const alias = original;
  const draft = { ...original, stock: 9 };
  console.log(alias === original, draft === original);
  console.log(draft.warehouse === original.warehouse);
  alias.stock = 10;
  draft.warehouse.city = "杭州";
  console.log(original.stock, draft.stock, original.warehouse.city);

  const independent = {
    ...original,
    warehouse: { ...original.warehouse, city: "苏州" },
  };
  console.log(independent.warehouse === original.warehouse);
  console.log(original.warehouse.city, independent.warehouse.city);
  console.log(({ stock: 9, ...original }).stock);
  console.log(({ ...original, stock: 9 }).stock);

  function change(record) {
    record.stock = 7;
    record = { stock: 0 };
    console.log("参数改绑后", record.stock);
  }
  change(original);
  console.log("调用后", original.stock);
}
