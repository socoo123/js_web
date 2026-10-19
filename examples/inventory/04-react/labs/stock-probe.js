export function attachStockProbe(target, doc, { leaky = false } = {}) {
  const node = doc.createElement("aside");
  node.className = "c45-stock-probe";
  node.textContent = "库存探针已挂载";
  doc.body.append(node);
  function updateProbe() { node.textContent = "库存 52"; }
  target.addEventListener("c45-stock-probe", updateProbe);
  return () => {
    node.remove();
    if (!leaky) target.removeEventListener("c45-stock-probe", updateProbe);
  };
}
