async function fetchProducts(url, { signal } = {}) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("HTTP " + response.status);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("商品数据应为数组");
  return rows;
}
