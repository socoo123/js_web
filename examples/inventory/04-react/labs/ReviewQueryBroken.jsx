// 有问题的写法：不同商品共用同一个新鲜缓存键
import { useQuery } from "@tanstack/react-query";
import ReviewQueryView from "./ReviewQueryView.jsx";

export default function ReviewQueryBroken({ productId, loadProduct }) {
  const query = useQuery({
    queryKey: ["products", "detail"],
    queryFn: ({ signal }) => loadProduct(productId, { signal }),
  });
  return <ReviewQueryView query={query} />;
}
