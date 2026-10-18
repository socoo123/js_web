import { useProductQuery } from "./product-query.js";
import { useRestockMutation } from "./useRestockMutation.js";
import { formatPriceCents } from "./product-form.js";

export default function CachedProductDetails({ productId, loadProduct, saveProduct }) {
  const query = useProductQuery(productId, loadProduct);
  const mutation = useRestockMutation(saveProduct);
  if (query.isPending) return <p role="status">{query.fetchStatus === "paused"
    ? "网络已离线，等待连接。" : `正在加载 ${productId}…`}</p>;
  if (query.data === undefined) return <section>
    <p role="alert">加载失败：{query.error.message}</p>
    <button type="button" onClick={() => query.refetch()}>重试详情</button>
  </section>;
  const product = query.data;
  return <section aria-label="缓存商品详情" aria-busy={query.isFetching}>
    <p role="status">详情已加载：{product.id}</p>
    <p>{product.name} · {product.category} · 缓存库存 {product.stock} 件 · ¥{formatPriceCents(product.priceCents)}</p>
    {query.isFetching && <p role="status">正在后台更新，保留上次结果。</p>}
    {query.fetchStatus === "paused" && <p role="status">网络已离线，当前显示缓存。</p>}
    {query.isError && <p role="alert">更新失败：{query.error.message}，当前显示上次结果。</p>}
    <button type="button" disabled={query.isFetching || mutation.isPending}
      onClick={() => query.refetch()}>重新读取详情</button>
    {saveProduct && <button type="button" disabled={mutation.isPending || product.stock >= 99999}
      onClick={() => mutation.mutate(productId)}>{mutation.isPending ? "正在保存并更新…" : "模拟远端补 1 件"}</button>}
    {mutation.isError && <p role="alert">保存失败：{mutation.error.message}</p>}
    {mutation.isSuccess && <p role="status">模拟保存成功；已使该商品详情查询失效。</p>}
  </section>;
}
