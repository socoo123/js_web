{
  // 练习 A：只为要改的路径创建新对象。
  const original = { id: "KB-001", stock: 12, warehouse: { city: "上海", shelf: "A-03" } };
  const draft = { ...original, warehouse: { ...original.warehouse, city: "杭州" } };
  draft.stock = 9;
  console.log(original.stock, original.warehouse.city, original.warehouse.shelf);
  console.log(draft.stock, draft.warehouse.city, draft.warehouse.shelf);
  console.log(original !== draft, original.warehouse !== draft.warehouse);
}
{
  // 练习 B：缺值可有默认，错误类型必须暴露出来。
  const records = [{}, { supplier: null }, { supplier: { address: { city: " 上海 " } } },
    { supplier: { address: { city: 42 } } }];
  for (const product of records) {
    const city = product.supplier?.address?.city;
    if (city === undefined || city === null) {
      console.log("未提供");
    } else if (typeof city !== "string" || city.trim() === "") {
      console.log("城市格式错误");
    } else {
      console.log(city.trim());
    }
  }
}
