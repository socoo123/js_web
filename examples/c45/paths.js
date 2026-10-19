const page = new URL("https://socoo123.github.io/js_web/");
const base = "/js_web/";
console.log(new URL("/media/inventory.svg", page).pathname);
console.log(new URL(`${base}media/inventory.svg`, page).pathname);
console.log(new URL(`${base}data/products/P002.json`, page).pathname);
