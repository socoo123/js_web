import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router";
import { products } from "../../../shared/products.js";
import ProductDetails from "./ProductDetails.jsx";
import NotFound from "./NotFound.jsx";

export default function ProductDetailRoute({ loadProduct }) {
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
    <p>以下是发布时的初始快照；列表中的补货与编辑保留在本次页面会话中。</p>
    <ProductDetails productId={productId} loadProduct={loadProduct} />
  </>;
}
