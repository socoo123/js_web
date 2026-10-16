const button = document.querySelector("#restock");
const stockNode = document.querySelector("#stock");
let stock = 12;
function render() { stockNode.textContent = String(stock); }
button.addEventListener("click", () => { stock += 1; render(); });
render();
