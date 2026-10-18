import { readProductResponse } from "../inventory/04-react/src/read-product.js";

// Response 只模拟 fetch 已经兑现后的返回对象。
const missing = await Promise.resolve(new Response("not found", { status: 404 }));
console.log("已兑现", missing.ok, missing.status);
try {
  await readProductResponse(missing, "P001");
} catch (error) {
  console.log(error.message);
}
try {
  await readProductResponse(new Response("不是 JSON"), "P001");
} catch (error) {
  console.log(error.name);
}
