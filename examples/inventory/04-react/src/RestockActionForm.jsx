import { useActionState, useOptimistic } from "react";
import { useRestockMutation } from "./useRestockMutation.js";
import { createRestockAction, initialRestockResult } from "./restock-action.js";
import RestockSubmit from "./RestockSubmit.jsx";

export default function RestockActionForm({ product, saveProduct, disabled = false }) {
  const mutation = useRestockMutation(saveProduct);
  const [optimisticStock, showOptimistic] = useOptimistic(product.stock);
  const [result, submitAction, isPending] = useActionState(createRestockAction({
    product, saveProduct: mutation.mutateAsync, showOptimistic,
  }), initialRestockResult);
  return <form action={submitAction} aria-label="Action 补货" aria-busy={isPending}>
    <input type="hidden" name="productId" value={product.id} />
    <p role="status">预览库存 {optimisticStock} 件{isPending ? "（等待确认）" : "（当前缓存）"}</p>
    <RestockSubmit disabled={disabled || product.stock >= 99999} />
    {!isPending && result.message && <p role={result.status === "error" ? "alert" : "status"}>{result.message}</p>}
  </form>;
}
