// 有问题的写法：刚请求显示表单，就读取尚未挂载的节点
import { useRef, useState } from "react";

export default function FocusMountBroken() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  function handleOpen() {
    setOpen(true);
    console.log("点击时节点", inputRef.current);
    inputRef.current?.focus();
  }
  return <section>
    <button onClick={handleOpen}>打开名称输入</button>
    {open && <label>商品名称<input ref={inputRef} defaultValue="机械键盘" /></label>}
  </section>;
}
