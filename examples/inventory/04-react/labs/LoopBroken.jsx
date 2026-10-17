// 有问题的写法：每次都生成新数组，更新自身依赖
import { useEffect, useRef, useState } from "react";

export default function LoopBroken({ products }) {
  const [visible, setVisible] = useState([]);
  const runsRef = useRef(0);
  useEffect(() => {
    console.log("筛选 setup", ++runsRef.current);
    // 仅供实验止损：让循环变成可观察的错误，避免页面持续占用资源。
    if (runsRef.current > 6) throw new Error("实验已停止：Effect 连续更新自己的依赖");
    setVisible(products.filter((product) => product.stock > 0));
  }, [products, visible]);
  return <p role="status">有货 {visible.length} 种</p>;
}
