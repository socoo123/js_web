import React from "react";
export default function Toolbar({ count, children }) {
  return <section aria-label="库存工具栏">
    <p>{count > 0 ? `显示 ${count} 件商品` : "没有商品"}</p>
    {children}
  </section>;
}
