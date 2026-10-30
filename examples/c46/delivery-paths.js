const pageURL = "https://socoo123.github.io/js_web/demos/inventory/";
console.log(new URL("/products.json", pageURL).pathname);
console.log(new URL("products.json", pageURL).pathname);
const hashDetail = new URL("https://socoo123.github.io/js_web/demos/inventory/#/products/P004");
console.log(hashDetail.pathname);
console.log(hashDetail.hash);
const pathDetail = new URL("products/P004/", hashDetail);
console.log(pathDetail.pathname);
