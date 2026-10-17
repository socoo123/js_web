import { useState } from "react";

export default function BasicCounter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
  }
  return <button type="button" onClick={handleClick}>核对 {count} 次</button>;
}
