import { products } from "../shared/products.js";

const product = products[0];
const nameNode = document.querySelector("#name");
const stockNode = document.querySelector("#stock");
const priceNode = document.querySelector("#price");

function renderProduct() {
  nameNode.textContent = product.name;
  stockNode.textContent = `库存：${product.stock} 件`;
  priceNode.textContent = `单价：¥${(product.priceCents / 100).toFixed(2)}`;
}

renderProduct();
