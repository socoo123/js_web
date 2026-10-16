const output = document.querySelector("#output");
const run = document.querySelector("#run");
run.addEventListener("click", async () => {
  run.disabled = true;
  output.textContent = "正在加载商品…";
  try {
    const rows = await fetchProducts(document.querySelector("#source").value);
    output.textContent = rows.length === 0 ? "暂无商品。" : "商品数 " + rows.length;
  } catch (error) {
    output.textContent = "加载失败：" + error.message;
  } finally {
    run.disabled = false;
  }
});
