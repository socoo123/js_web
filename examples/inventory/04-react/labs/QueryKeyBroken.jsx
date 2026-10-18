// 有问题的写法：不同商品共用了同一个缓存键
import { useQuery } from "@tanstack/react-query";

export default function QueryKeyBroken({ productId, loadProduct }) {
  const query = useQuery({
    queryKey: ["products", "detail"],
    queryFn: ({ signal }) => loadProduct(productId, { signal }),
  });
  return <p>{query.data ? `详情已加载：${query.data.id}` : "正在加载…"}</p>;
}
