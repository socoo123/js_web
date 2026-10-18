import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productKey } from "./product-query.js";

export function useRestockMutation(saveProduct) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id) => saveProduct(id),
    retry: false,
    onSuccess: async (saved) => {
      await client.invalidateQueries({ queryKey: productKey(saved.id), exact: true });
    },
  });
}
