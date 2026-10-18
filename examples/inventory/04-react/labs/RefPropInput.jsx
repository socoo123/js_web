import { useRef } from "react";

function ProductInput({ ref }) {
  return <label>商品名称 <input ref={ref} defaultValue="机械键盘" /></label>;
}

export default function RefPropInput() {
  const inputRef = useRef(null);
  return <><ProductInput ref={inputRef} />
    <button onClick={() => inputRef.current.focus()}>聚焦名称</button></>;
}
