{
  function importProduct(text) {
    const raw = JSON.parse(text);
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("商品必须是对象");
    }
    if (typeof raw.id !== "string" || raw.id.trim() === "") {
      throw new Error("编号必须是非空字符串");
    }
    if (typeof raw.name !== "string" || raw.name.trim() === "") {
      throw new Error("名称必须是非空字符串");
    }
    if (!Number.isSafeInteger(raw.stock) || raw.stock < 0) {
      throw new Error("库存必须是非负安全整数");
    }
    if (!Number.isSafeInteger(raw.priceCents) || raw.priceCents < 0) {
      throw new Error("价格分必须是非负安全整数");
    }
    let city = "未提供";
    if (raw.warehouse !== undefined) {
      if (raw.warehouse === null || typeof raw.warehouse !== "object"
          || Array.isArray(raw.warehouse)) {
        throw new Error("仓库必须是对象");
      }
      if (typeof raw.warehouse.city !== "string" || raw.warehouse.city.trim() === "") {
        throw new Error("仓库城市必须是非空字符串");
      }
      city = raw.warehouse.city.trim();
    }
    return {
      id: raw.id.trim().toUpperCase(),
      name: raw.name.trim(),
      stock: raw.stock,
      priceCents: raw.priceCents,
      warehouse: { city },
    };
  }

  const good = '{"id":" kb-001 ","name":" 键盘 ","stock":12,"priceCents":19900,"warehouse":{"city":" 上海 "},"debug":true}';
  const product = importProduct(good);
  console.log(JSON.stringify(product));
  console.log(Object.hasOwn(product, "debug"));

  const badInputs = [
    '{"stock":12,}',
    'null',
    '[]',
    '{"id":"KB-001","name":"键盘","stock":"12","priceCents":19900}',
    '{"id":"KB-001","name":"键盘","stock":-1,"priceCents":19900}',
    '{"id":"KB-001","name":"键盘","stock":1.5,"priceCents":19900}',
    '{"id":"KB-001","name":"键盘","stock":12,"priceCents":19900,"warehouse":null}',
  ];
  for (const text of badInputs) {
    try {
      importProduct(text);
    } catch (error) {
      console.log(error.name === "SyntaxError" ? "JSON 语法错误" : error.message);
    }
  }
}
