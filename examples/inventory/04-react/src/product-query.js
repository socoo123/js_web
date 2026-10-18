import { useQuery } from "@tanstack/react-query";

export const productKey = (id) => ["products", "detail", id];

export function useProductQuery(productId, loadProduct) {
  return useQuery({
    queryKey: productKey(productId),
    queryFn: ({ signal }) => loadProduct(productId, { signal }),
  });
}
