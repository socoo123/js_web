// 有问题的写法：收到新输入后，仍把旧快照写回 state。
import { useState } from "react";

export default function LockedNameBroken() {
  const [name, setName] = useState("机械键盘");
  function handleChange(event) {
    setName(name);
  }
  return <label>商品名称<input value={name} onChange={handleChange} /></label>;
}
