// region editor-setup
import { parseStock } from "../../src/core/inventory.js";
export function connectEditor(shell) {
  const { editor, repository, refresh, close } = shell;
  const stock = editor.querySelector("#edit-stock");
  const save = editor.querySelector("#save");
  const cancel = editor.querySelector("#cancel");
  const feedback = editor.querySelector("#feedback");
  const valueMessage = editor.querySelector("#value-message");
  let product, opener, busy = false;
// endregion editor-setup
// region editor-validate
  function validate() {
    try {
      const value = parseStock(stock.value);
      stock.valueState = "None";
      feedback.textContent = `草稿库存 ${value} 件；保存前原值仍为 ${product.stock}`;
      valueMessage.textContent = "";
      save.disabled = busy;
      return value;
    } catch (error) {
      stock.valueState = "Negative";
      valueMessage.textContent = feedback.textContent = error.message;
      save.disabled = true;
      return null;
    }
  }
// endregion editor-validate
// region editor-open
  shell.onEdit((selected, button) => {
    if (busy) return;
    product = selected; opener = button;
    editor.hidden = false;
    editor.querySelector("#editor-title").textContent = `编辑 ${product.id}`;
    stock.value = String(product.stock);
    validate(); stock.focus();
  });
  stock.addEventListener("ui5-input", () => validate());
  cancel.addEventListener("ui5-click", () => { product = null; close(opener); });
// endregion editor-open
// region editor-save
  save.addEventListener("ui5-click", async () => {
    const value = validate();
    if (busy || value === null) return;
    busy = true; save.disabled = cancel.disabled = stock.readonly = true;
    try {
      await repository.save({ ...product, stock: value });
      await refresh(); close(opener); product = null;
    } catch (error) {
      feedback.textContent = `保存失败：${error.message}`;
    } finally {
      busy = false; cancel.disabled = stock.readonly = false;
      if (product) save.disabled = false;
    }
  });
}
// endregion editor-save
