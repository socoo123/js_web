import { summarizeCategories } from "./report-summary.js";

export default function InventoryReport({ products }) {
  const groups = summarizeCategories(products);
  return <table>
    <caption>按分类汇总（本地库存）</caption>
    <thead><tr><th scope="col">分类</th><th scope="col">种类</th>
      <th scope="col">库存</th><th scope="col">价值（元）</th></tr></thead>
    <tbody>{groups.map((group) => <tr key={group.category}>
      <th scope="row">{group.category}</th><td>{group.count}</td>
      <td>{group.stock}</td><td>{(group.valueCents / 100).toFixed(2)}</td>
    </tr>)}</tbody>
  </table>;
}
