sap.ui.define([], () => {
  "use strict";
  const categories = ["外设", "显示器", "配件", "音频"];
  function toDraft(product) {
    return {
      id: product.id, name: product.name, category: product.category,
      stock: String(product.stock), price: `${Math.trunc(product.priceCents / 100)}.${String(product.priceCents % 100).padStart(2, "0")}`,
      errors: {}, hasErrors: false,
    };
  }
  function parseDraft(draft) {
    const name = draft.name.trim();
    const stockText = draft.stock.trim();
    const priceText = draft.price.trim();
    const stock = Number(stockText);
    const [whole, fraction = ""] = priceText.split(".");
    const priceCents = Number(whole + fraction.padEnd(2, "0"));
    const errors = {
      name: name.length < 1 || name.length > 40,
      category: !categories.includes(draft.category),
      stock: !/^\d+$/.test(stockText) || !Number.isInteger(stock) || stock > 99999,
      price: !/^\d+(\.\d{1,2})?$/.test(priceText) || !Number.isSafeInteger(priceCents),
    };
    const hasErrors = Object.values(errors).some(Boolean);
    return { errors, hasErrors, value: hasErrors ? null : { name, category: draft.category, stock, priceCents } };
  }
  function summarize(products) {
    return products.reduce((sum, product) => ({
      count: sum.count + 1,
      stock: sum.stock + product.stock,
      valueCents: sum.valueCents + product.stock * product.priceCents,
    }), { count: 0, stock: 0, valueCents: 0 });
  }
  return { toDraft, parseDraft, summarize };
});
