const brokenKey = "js_web:c14:broken:v1";
const output = document.querySelector("#output");
try {
  const raw = localStorage.getItem(brokenKey);
  const rows = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(rows)) throw new Error("商品数据应为数组");
  output.textContent = "商品数 " + rows.length;
} catch (error) {
  output.textContent = "本地数据无法读取，请点击清除练习副本再刷新。";
  console.warn("练习副本读取失败", error);
}
