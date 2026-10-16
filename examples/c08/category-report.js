import { products } from "../shared/products.js";

const categories = ["外设", "显示器", "配件", "音频"];
const report = categories.map(category => {
  const group = products.filter(product => product.category === category);
  const stock = group.reduce((total, product) => total + product.stock, 0);
  return `${category}：${group.length} 种，${stock} 件`;
});
report.forEach(line => console.log(line));
