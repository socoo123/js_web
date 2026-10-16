// 有问题的写法：默认值只处理缺失，坏 JSON 仍会抛错
const brokenKey = "js_web:c14:broken:v1";
const raw = localStorage.getItem(brokenKey);
const rows = JSON.parse(raw ?? "[]");
document.querySelector("#output").textContent = "商品数 " + rows.length;
