async function load() {
  try {
    const rows = await fetchProducts("./missing.json");
    console.log("商品数", rows.length);
  } catch (error) {
    console.log("错误", error.message);
  }
}
load();
