{
  const id = "KB-001";
  const product = {
    id,
    name: "键盘",
    stock: 12,
    "display-name": "机械键盘",
    warehouse: { city: "上海", shelf: "A-03" },
    note: undefined,
  };
  const field = "stock";
  console.log(product.name, product[field], product["display-name"]);
  console.log(product.field);
  console.log(Object.hasOwn(product, "note"), Object.hasOwn(product, "missing"));

  const { name: productName, stock, category = "未分类" } = product;
  product.stock = 9;
  console.log(productName, stock, product.stock, category);
  const { note = "暂无备注" } = { note: null };
  console.log(note);

  console.log(product.supplier?.address?.city ?? "未提供");
  const supplier = null;
  console.log(supplier?.address?.city ?? "未提供");
  try {
    console.log((supplier?.address).city);
  } catch (error) {
    console.log(error.name);
  }
  product.category = "外设";
  delete product.note;
  console.log(product.category, Object.hasOwn(product, "note"));
}
