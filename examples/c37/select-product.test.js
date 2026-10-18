import { products } from "../shared/products.js";
import { selectProduct } from "./select-product.js";

it("排序后编辑鼠标，仍按商品编号读取合法库存 0", () => {
  const visible = products.toSorted((a, b) => a.stock - b.stock);
  const selected = selectProduct(products, { id: visible[0].id, index: 0 });
  expect(selected).toMatchObject({ id: "P002", stock: 0 });
});

it("筛选和分页后，显示位置从零开始仍定位到耳机", () => {
  const page = products.filter((product) => product.category === "音频").slice(0, 1);
  expect(selectProduct(products, { id: page[0].id, index: 0 }).id).toBe("P006");
});

it("商品已删除时返回空值，让界面结束编辑", () => {
  expect(selectProduct(products.filter((product) => product.id !== "P002"),
    { id: "P002", index: 0 })).toBeNull();
});
