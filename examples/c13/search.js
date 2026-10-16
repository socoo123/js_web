const search = document.querySelector("#search");
const output = document.querySelector("#output");
let activeController;

search.addEventListener("input", async () => {
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const keyword = search.value.trim().toLowerCase();
  output.textContent = "正在搜索…";
  try {
    const rows = await fetchProducts("../shared/products.json", { signal: controller.signal });
    const matches = rows.filter(product => product.name.toLowerCase().includes(keyword));
    output.textContent = matches.length === 0 ? "没有匹配的商品。"
      : matches.map(product => product.id + " " + product.name).join("\n");
  } catch (error) {
    if (error.name === "AbortError") return;
    output.textContent = "搜索失败：" + error.message;
  }
});
