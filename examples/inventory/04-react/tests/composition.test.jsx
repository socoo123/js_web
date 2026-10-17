import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { products } from "../../../shared/products.js";
import App from "../src/App.jsx";
import ProductCard from "../src/ProductCard.jsx";
import ProductList from "../src/ProductList.jsx";
import InventoryToolbar from "../src/InventoryToolbar.jsx";

it("列表传递各自的商品，售罄商品保留 0 件与自己的价格", () => {
  const html = renderToStaticMarkup(<ProductList products={[products[1]]} />);
  expect(html).toContain("无线鼠标");
  expect(html).toContain(">0</strong>");
  expect(html).toContain("已售罄");
  expect(html).toContain("129.00");
  expect(html).not.toContain("机械键盘");
  expect(html).not.toContain("标签：");
});

it("空列表显示默认或自定义提示，0 件仍有卡片", () => {
  expect(renderToStaticMarkup(<ProductList products={[]} />)).toContain("没有匹配的商品。");
  expect(renderToStaticMarkup(<ProductList products={[]} emptyMessage="外设已清空" />)).toContain("外设已清空");
  expect(renderToStaticMarkup(<ProductList products={[products[1]]} />)).toContain("<article");
});

it("工具栏保留数量 0 与调用方提供的内容", () => {
  const html = renderToStaticMarkup(<InventoryToolbar count={0}><span>待盘点</span></InventoryToolbar>);
  expect(html).toContain("共 0 种商品");
  expect(html).toContain("<span>待盘点</span>");
});

it("重复显示相同输入不会改商品及嵌套标签", () => {
  const product = Object.freeze({ ...products[0], tags: Object.freeze([...products[0].tags]) });
  const first = renderToStaticMarkup(<ProductCard product={product} />);
  expect(renderToStaticMarkup(<ProductCard product={product} />)).toBe(first);
  expect(product.stock).toBe(12);
  expect(product.tags).toEqual(["热销"]);
});

it("完整应用显示六种商品和各自唯一的标题关联", () => {
  const html = renderToStaticMarkup(<App />);
  expect(html).toContain("共 6 种商品");
  expect(html.match(/<article /g)).toHaveLength(6);
  for (const product of products) {
    expect(html).toContain(`id="product-${product.id}"`);
    expect(html).toContain(`aria-labelledby="product-${product.id}"`);
    expect(html).toContain(product.name);
  }
});
