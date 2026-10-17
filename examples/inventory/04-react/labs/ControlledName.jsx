import { useState } from "react";

export default function ControlledName() {
  const [name, setName] = useState("机械键盘");
  return <label>商品名称<input value={name} onChange={(event) => setName(event.target.value)} /></label>;
}
