import { products } from "../shared/products.js";
const filter = () => products.filter((product) => product.stock > 0);
console.log(Object.is(filter(), filter()));
const rows = filter();
console.log(Object.is(rows, rows));
const firstChoose = (id) => id;
const nextChoose = (id) => id;
console.log(Object.is(firstChoose, nextChoose));
console.log(Object.is(products[0], { ...products[0] }));
