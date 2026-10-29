import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useInventory } from "./InventoryProvider.jsx";
import { detailOptions } from "./query-options.js";
export default function ProductDetail({ productId }) {
  const { repository } = useInventory();
  const detail = useQuery(detailOptions(repository, productId));
  return <section aria-label="商品详情">
    {detail.isPending && <p role="status">正在加载 {productId}</p>}
    {detail.isFetching && !detail.isPending && <p role="status">正在后台更新</p>}
    {detail.isError && <p role="alert">{detail.error.message}</p>}
    {detail.data && <p>{detail.data.id} {detail.data.name}：库存 {detail.data.stock}</p>}
    <button onClick={() => detail.refetch()}>重试详情</button>
    <button onClick={() => { repository.failNext("get"); detail.refetch(); }}>模拟详情失败</button>
  </section>;
}
