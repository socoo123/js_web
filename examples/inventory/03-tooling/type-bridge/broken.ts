// 有问题的写法：把字符串传给声明接收 number 的参数
function restock(stock: number, amount: number): number {
  return stock + amount;
}

const incoming: string = "3";
const result = restock(12, incoming);
console.log(result);
document.querySelector("#result")!.textContent = String(result);
