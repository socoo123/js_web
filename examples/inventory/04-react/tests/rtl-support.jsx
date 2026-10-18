import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";

const clients = new Set();

export function createTestClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  clients.add(client);
  return client;
}

afterEach(() => {
  cleanup();
  for (const client of clients) client.clear();
  clients.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
