import { useEffect, useRef } from "react";
import { Link } from "react-router";

export default function NotFound({ message = "找不到这个页面。" }) {
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, [message]);
  return <section>
    <h1 ref={headingRef} tabIndex={-1}>页面不存在</h1>
    <p>{message}</p>
    <Link to="/products">返回全部商品</Link>
  </section>;
}
