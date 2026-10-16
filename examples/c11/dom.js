const list = document.querySelector("#products");
const before = list.querySelectorAll("li");
const row = document.createElement("li");
row.textContent = "P002 无线鼠标：0 件";
list.append(row);
console.log(before.length);                       // → 1
console.log(list.querySelectorAll("li").length);  // → 2
console.log(document.querySelector("#missing")); // → null
