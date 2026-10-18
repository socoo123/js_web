import { useProductQuery } from "../src/product-query.js";
import ReviewQueryView from "./ReviewQueryView.jsx";

export default function ReviewQueryFixed({ productId, loadProduct }) {
  const query = useProductQuery(productId, loadProduct);
  return <ReviewQueryView query={query} />;
}
