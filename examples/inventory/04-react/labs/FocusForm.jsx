import { useRef, useState } from "react";

export default function FocusForm() {
  const quantityRef = useRef(null);
  const [quantity, setQuantity] = useState("3");
  const [stock, setStock] = useState(12);
  function handleSubmit(event) {
    event.preventDefault();
    const amount = Number(quantity);
    if (quantity.trim() === "" || !Number.isInteger(amount) || amount < 1 || amount > 99999 - stock) {
      quantityRef.current?.focus();
      return;
    }
    setStock((n) => n + amount);
    setQuantity("");
    quantityRef.current?.focus();
  }
  return <form onSubmit={handleSubmit}>
    <p role="status">P001 机械键盘：{stock} 件</p>
    <label>补货数量<input ref={quantityRef} value={quantity}
      onChange={(event) => setQuantity(event.target.value)} /></label>
    <button>确认补货</button>
  </form>;
}
