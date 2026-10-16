// 有问题的写法：浅复制后直接修改共享的仓库对象
const savedProduct = { id: "P001", stock: 12, warehouse: { city: "上海", shelf: "A-03" } };
const editDraft = { ...savedProduct };
editDraft.stock = 15;
editDraft.warehouse.city = "杭州";
console.log("原商品", savedProduct.stock, savedProduct.warehouse.city); // → 原商品 12 杭州
console.log("草稿", editDraft.stock, editDraft.warehouse.city); // → 草稿 15 杭州
