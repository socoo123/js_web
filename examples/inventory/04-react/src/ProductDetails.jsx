import { useProductRequest } from "./useProductRequest.js";
import RequestView from "./RequestView.jsx";

export default function ProductDetails({ productId, loadProduct }) {
  const { request, cancel, retry } = useProductRequest(productId, loadProduct);
  return <RequestView request={request} onCancel={cancel} onRetry={retry} />;
}
