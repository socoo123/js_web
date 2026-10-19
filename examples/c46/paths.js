const page = "https://socoo123.github.io/js_web/07-project/c46-static-build-pages/";
console.log(new URL("/data/products/P002.json", page).pathname);
console.log(new URL("data/products/P002.json", page).pathname);
console.log(new URL("/js_web/data/products/P002.json", page).pathname);
