export default function ReviewQueryView({ query }) {
  if (query.isPending) return <p role="status">正在读取…</p>;
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  return <p role="status">详情 {query.data.id}：{query.data.name}，库存 {query.data.stock} 件</p>;
}
