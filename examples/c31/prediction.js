const current = new URLSearchParams("q=鼠标&order=stock");
const next = new URLSearchParams(current);
next.set("q", "键盘");
console.log(current.get("q"), next.get("q"));
console.log(next.get("order"));
console.log(typeof next.get("order"));
