let inventory = [{ id: "P002", stock: 0 }];
const next = inventory.map(product => ({ ...product, stock: 3 }));
function persist() {
  throw new Error("存储不可用"); // 模拟浏览器拒绝写入
}
try {
  persist(next);
  inventory = next;
} catch (error) {
  console.log("保存失败", error.message);
}
console.log("当前库存", inventory[0].stock);
