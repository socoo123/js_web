// 有问题的写法：把字段访问写成了普通文字
import { products } from "../../../shared/products.js";

const product = products[0];

export default function ProductCardBroken() {
  return <h2 title={product.name}>product.name</h2>;
}
