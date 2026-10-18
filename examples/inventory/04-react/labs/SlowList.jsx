import { memo } from "react";
import { demonstrationCost } from "./performance-data.js";

function SlowRow({ product, onChoose }) {
  const score = demonstrationCost(product.stock);
  return <li data-score={score}>{product.name}：{product.stock} 件
    <button onClick={() => onChoose(product.id)}>查看 {product.id}</button></li>;
}

export function SlowListView({ rows, onChoose }) {
  return <ul aria-label="筛选结果">{rows.map(({ rowKey, product }) =>
    <SlowRow key={rowKey} product={product} onChoose={onChoose} />)}</ul>;
}

export default memo(SlowListView);
