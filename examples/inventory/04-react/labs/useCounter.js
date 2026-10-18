import { useState } from "react";

export function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount((n) => n + 1) };
}
