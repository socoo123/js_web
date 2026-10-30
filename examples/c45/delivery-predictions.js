const deliveryPage = "https://socoo123.github.io/js_web/demos/inventory/";
console.log(new URL("/products.json", deliveryPage).pathname);
console.log(new URL("products.json", deliveryPage).pathname);
const originalRows = [{ id: "P004", stock: 3 }];
const copiedRows = [...originalRows];
console.log(originalRows === copiedRows);
console.log(originalRows[0] === copiedRows[0]);
