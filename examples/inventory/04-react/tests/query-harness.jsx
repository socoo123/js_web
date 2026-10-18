import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createInventoryQueryClient } from "../src/query-client.js";

export const flushQuery = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)); });
export function QueryHarness({ client, children }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
export function testClient() {
  const client = createInventoryQueryClient();
  client.setDefaultOptions({ queries: { staleTime: 30_000, gcTime: Infinity, retry: false }, mutations: { retry: false } });
  return client;
}
