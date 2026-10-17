const data = new FormData();
data.set("stock", "0");
data.set("featured", "on");
console.log(typeof data.get("stock"), data.get("stock") === 0);
console.log(data.has("featured"), data.get("featured"));
data.delete("featured");
console.log(data.has("featured"), data.get("featured"));
