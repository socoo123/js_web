const data = new FormData();
data.set("productId", "P001");
data.set("amount", "1");
console.log(data.get("productId"));
console.log(typeof data.get("amount"));
console.log(data.get("missing"));
