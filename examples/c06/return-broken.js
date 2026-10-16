// 有问题的写法：花括号函数体里漏了 return
const hasStock = product => { product.stock > 0; };
console.log(hasStock({ id: "P001", stock: 12 })); // → undefined
