// 有问题的写法：把派生统计只初始化一次
import { useState } from "react";

export default function ReviewSummaryBroken({ products }) {
  const [totalStock] = useState(() => products.reduce((sum, product) => sum + product.stock, 0));
  return <p>统计库存 {totalStock} 件</p>;
}
