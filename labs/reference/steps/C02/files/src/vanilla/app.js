import products from "../../data/products.json" with { type: "json" };
import { describeProduct, stockValue, restockProduct } from "../core/inventory.js";

let product = structuredClone(products[0]);
function render() {
  document.querySelector("#product").textContent = describeProduct(product);
  document.querySelector("#value").textContent = `库存价值 ${stockValue(product)} 分`;
}
document.querySelector("#restock-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    product = restockProduct(product, document.querySelector("#amount").value);
    render();
    document.querySelector("#feedback").textContent = "补货已保存";
  } catch (error) {
    document.querySelector("#feedback").textContent = error.message;
  }
});
render();
