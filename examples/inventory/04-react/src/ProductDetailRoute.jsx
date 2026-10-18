import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router";
import { products } from "../../../shared/products.js";
import CachedProductDetails from "./CachedProductDetails.jsx";
import NotFound from "./NotFound.jsx";

export default function ProductDetailRoute({ loadProduct, saveProduct }) {
  const { productId } = useParams();
  const { search } = useLocation();
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, [productId]);
  if (!products.some((product) => product.id === productId)) {
    return <NotFound message="没有该编号的初始快照，请从六种初始商品中选择。" />;
  }
  return <>
    <h1 ref={headingRef} tabIndex={-1}>商品详情 {productId}</h1>
    <Link to={{ pathname: "/products", search }}>返回筛选列表</Link>
    <nav aria-label="切换初始商品">
      {products.map(({ id }) => <Link key={id} to={{ pathname: `/products/${id}`, search }}>{id}{" "}</Link>)}
    </nav>
    <p>以下详情用静态 JSON 初始化浏览器内 mock；模拟远端补货只改变这份副本，刷新恢复。列表库存仍是独立的本地练习数据。</p>
    <CachedProductDetails key={productId} productId={productId} loadProduct={loadProduct} saveProduct={saveProduct} />
  </>;
}
