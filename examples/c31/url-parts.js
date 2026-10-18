const url = new URL("https://socoo123.github.io/js_web/#/products/P002?q=鼠标");
console.log(url.pathname);
console.log(url.search || "外层无查询参数");
console.log(decodeURI(url.hash));
const route = new URL(url.hash.slice(1), url.origin);
console.log(route.pathname, route.searchParams.get("q"));
