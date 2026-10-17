// 有问题的写法：显示库存的函数修改了调用方传入的对象
import { products } from "../shared/products.js";

const product = { ...products[0] };
function stockLabel(product) {
  product.stock += 1;
  return `${product.name}：${product.stock} 件`;
}

console.log(stockLabel(product));
console.log(stockLabel(product));
console.log("输入库存", product.stock);
