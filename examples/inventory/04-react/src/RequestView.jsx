import { formatPriceCents } from "./product-form.js";

export default function RequestView({ request, onCancel, onRetry }) {
  const { status, id, data, error } = request;
  return <section aria-labelledby="details-heading" aria-busy={status === "loading"}>
    <h2 id="details-heading">初始商品详情</h2>
    {status === "idle" && <p role="status">请选择商品查看详情。</p>}
    {status === "loading" && <p role="status">正在加载 {id}… <button type="button" onClick={onCancel}>取消加载</button></p>}
    {status === "error" && <><p role="alert">加载 {id} 失败：{error}</p><button type="button" onClick={onRetry}>重试详情</button></>}
    {status === "cancelled" && <><p role="status">已取消 {id}。</p><button type="button" onClick={onRetry}>重新加载</button></>}
    {status === "success" && <>
      <p role="status">详情已加载：{data.id}</p>
      <p>{data.name} · {data.category} · 初始库存 {data.stock} 件 · ¥{formatPriceCents(data.priceCents)}</p>
      <button type="button" onClick={onRetry}>重新加载</button>
    </>}
  </section>;
}
