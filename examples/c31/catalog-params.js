import { readCatalogParams } from "../inventory/04-react/src/catalog-url.js";

for (const search of ["?q=鼠标&category=外设&order=stock", "?category=未知&order=random", ""]) {
  const { query, category, order } = readCatalogParams(new URLSearchParams(search));
  console.log(JSON.stringify({ query, category, order }));
}
