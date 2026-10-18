import { useStaleRequest } from "./useStaleRequest.js";
import RequestView from "../src/RequestView.jsx";

export default function StaleHookDetails({ productId, loadProduct }) {
  const { request, cancel, retry } = useStaleRequest(productId, loadProduct);
  return <><p>当前选择：{productId}</p><RequestView request={request} onCancel={cancel} onRetry={retry} /></>;
}
