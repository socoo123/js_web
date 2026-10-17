const base = "https://example.com/js_web/examples/inventory/02-web/app.js";
console.log(new URL("../01-core/inventory.js", base).pathname);
console.log(new URL("/inventory.js", base).pathname);
