const current = "https://example.github.io/js_web/#/products/P002";
for (const target of ["data/products/P002.json", "/data/products/P002.json",
  "#/products/P004", "/js_web/products/P004/"]) {
  const url = new URL(target, current);
  console.log(url.pathname, url.hash || "无片段");
}
