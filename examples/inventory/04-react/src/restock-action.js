export const initialRestockResult = { status: "idle", message: "" };

export function createRestockAction({ product, saveProduct, showOptimistic }) {
  return async function restock(previousState, formData) {
    if (formData.get("productId") !== product.id) {
      return { status: "error", message: "商品编号不匹配，请重新打开详情。" };
    }
    if (product.stock >= 99999) {
      return { status: "error", message: "库存已到上限。" };
    }
    showOptimistic(product.stock + 1);
    try {
      const saved = await saveProduct(product.id);
      return { status: "success", message: `模拟保存成功：${saved.id} 已保存 ${saved.stock} 件。` };
    } catch (error) {
      return { status: "error", message: `保存失败：${error.message}` };
    }
  };
}
