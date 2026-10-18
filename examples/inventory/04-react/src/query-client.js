import { QueryClient } from "@tanstack/react-query";

export function createInventoryQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, gcTime: 300_000, retry: 1, retryDelay: 300 },
      mutations: { retry: false },
    },
  });
}
