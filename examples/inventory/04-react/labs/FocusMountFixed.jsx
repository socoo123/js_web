import { useEffect, useRef, useState } from "react";

export function NameInput() {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return <label>商品名称<input ref={inputRef} defaultValue="机械键盘" /></label>;
}

export default function FocusMountFixed() {
  const [open, setOpen] = useState(false);
  return <section>
    <button onClick={() => setOpen(true)}>打开名称输入</button>
    {open && <NameInput />}
  </section>;
}
