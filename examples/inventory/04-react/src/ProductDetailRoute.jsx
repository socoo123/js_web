import { useContext, useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router";
import { products } from "../../../shared/products.js";
import ActionProductDetails from "./ActionProductDetails.jsx";
import NotFound from "./NotFound.jsx";
import { ProductsContext } from "./InventoryContext.jsx";
import { formatPriceCents } from "./product-form.js";

export default function ProductDetailRoute({ loadProduct, saveProduct }) {
  const { productId } = useParams();
  const { search } = useLocation();
  const localProducts = useContext(ProductsContext);
  const localProduct = localProducts.find((product) => product.id === productId);
  const hasSnapshot = products.some((product) => product.id === productId);
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, [productId]);
  if (!localProduct && !hasSnapshot) {
    return <NotFound message="没有该编号的本地商品或初始快照，请返回列表选择。" />;
  }
  return <>
    <h1 ref={headingRef} tabIndex={-1}>商品详情 {productId}</h1>
    <Link to={{ pathname: "/products", search }}>返回筛选列表</Link>
    <section aria-label="本地商品详情">
      <h2>本地商品</h2>
      {localProduct
        ? <p>{localProduct.name} · {localProduct.category} · 本地库存 {localProduct.stock} 件 · ¥{formatPriceCents(localProduct.priceCents)}</p>
        : <p>该商品已从本地库存删除。</p>}
    </section>
    <nav aria-label="切换初始商品">
      {products.map(({ id }) => <Link key={id} to={{ pathname: `/products/${id}`, search }}>{id}{" "}</Link>)}
    </nav>
    <p>以下详情用静态 JSON 初始化浏览器内 mock；模拟远端补货只改变这份副本，刷新恢复。列表库存仍是独立的本地练习数据。</p>
    {hasSnapshot
      ? <ActionProductDetails key={productId} productId={productId} loadProduct={loadProduct} saveProduct={saveProduct} />
      : <p>这是本地新增商品，没有初始 JSON 快照。</p>}
  </>;
}
