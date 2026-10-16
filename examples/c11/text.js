const name = "<b>机械键盘</b>";
const label = document.querySelector("#safe");
label.textContent = name;
console.log(label.textContent);           // → <b>机械键盘</b>
console.log(label.querySelector("b"));    // → null
