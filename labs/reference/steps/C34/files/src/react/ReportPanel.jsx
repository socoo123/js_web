// region report
import React from "react";
import { categories, summarize } from "../core/inventory.js";
export default function ReportPanel({ products, fail = false }) {
  if (fail) throw new Error("模拟报表渲染失败");
  return <section aria-label="分类报表"><h2>分类报表</h2>
    <table><caption>当前全部库存，按分类汇总</caption>
      <thead><tr><th scope="col">分类</th><th scope="col">种类</th><th scope="col">库存</th><th scope="col">价值（分）</th></tr></thead>
      <tbody>{categories.map((category) => {
        const summary = summarize(products.filter((product) => product.category === category));
        return <tr key={category}><th scope="row">{category}</th><td>{summary.count}</td><td>{summary.stock}</td><td>{summary.valueCents}</td></tr>;
      })}</tbody>
    </table>
  </section>;
}
// endregion report
