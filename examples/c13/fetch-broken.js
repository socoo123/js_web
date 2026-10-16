// 有问题的写法：直接解析 404 页，掩盖了 HTTP 错误
async function load() {
  try {
    const response = await fetch("./missing.json");
    const rows = await response.json();
    console.log("商品数", rows.length);
  } catch (error) {
    console.log("错误", error.name);
  }
}
load();
