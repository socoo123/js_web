// 有问题的写法：把可能为 0 的数放在 && 左侧
export default function TagsBroken({ product }) {
  return <div>{product.tags.length && <p>标签：{product.tags.join("、")}</p>}</div>;
}
