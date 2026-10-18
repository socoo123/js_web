import { useSearchParams } from "react-router";
import { readCatalogParams } from "./catalog-url.js";

export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();
  const filters = readCatalogParams(params);
  function changeFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value === "" || (key === "category" && value === "全部") || (key === "order" && value === "id")) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }
  const search = params.size === 0 ? "" : `?${params.toString()}`;
  return { ...filters, changeFilter, search };
}
