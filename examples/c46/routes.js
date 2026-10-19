const detail = new URL("https://socoo123.github.io/js_web/#/products/P002");
console.log("请求路径", detail.pathname); // → 请求路径 /js_web/
console.log("浏览器路由", detail.hash); // → 浏览器路由 #/products/P002
const clean = new URL("https://socoo123.github.io/js_web/products/P002");
console.log("请求路径", clean.pathname); // → 请求路径 /js_web/products/P002
