import assert from "node:assert/strict";
import { readFile, stat, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dist = new URL("../dist/", import.meta.url);
const html = await readFile(new URL("index.html", dist), "utf8");
const assets = [...html.matchAll(/(?:src|href)="(\/js_web\/assets\/[^"?#]+)"/g)].map((match) => match[1]);
assert(assets.some((url) => url.endsWith(".js")), "首页需要 base 正确的 JS 入口");
assert(assets.some((url) => url.endsWith(".css")), "首页需要 base 正确的 CSS");
for (const url of assets) {
  assert((await stat(new URL(url.slice("/js_web/".length), dist))).isFile(), `资源缺失：${url}`);
}
assert(!html.includes("/src/main.jsx"), "产物应引用构建后的 JS");
const products = JSON.parse(await readFile(new URL("../../../shared/products.json", import.meta.url), "utf8"));
for (const product of products) {
  const actual = JSON.parse(await readFile(new URL(`data/products/${product.id}.json`, dist), "utf8"));
  assert.deepEqual(actual, product, `${product.id} 静态数据与固定起点一致`);
}
await access(new URL("media/inventory.svg", dist));
for (const missing of ["products/P002/index.html", "labs/delivery.html"]) {
  await assert.rejects(access(new URL(missing, dist)), `${missing} 不应是生产入口`);
}
console.log(`Pages 产物通过：${assets.length} 个入口资源、6 份商品、base=/js_web/；详情由 hash 路由处理。`);
console.log(`上传目录：${fileURLToPath(dist)}`);
