import { useProductQuery } from "./product-query.js";
import CachedProductDetails from "./CachedProductDetails.jsx";
import RestockActionForm from "./RestockActionForm.jsx";

export default function ActionProductDetails({ productId, loadProduct, saveProduct }) {
  const query = useProductQuery(productId, loadProduct);
  return <>
    <CachedProductDetails productId={productId} loadProduct={loadProduct} />
    {query.data && saveProduct && <RestockActionForm key={productId} product={query.data}
      saveProduct={saveProduct} disabled={query.isFetching} />}
  </>;
}
