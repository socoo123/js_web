export function readCatalogParams(params) {
  const category = params.get("category");
  const order = params.get("order");
  return {
    query: params.get("q") ?? "",
    category: ["外设", "显示器", "配件", "音频"].includes(category) ? category : "全部",
    order: ["stock", "price"].includes(order) ? order : "id",
  };
}
