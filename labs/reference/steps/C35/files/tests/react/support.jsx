import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import seed from "../../data/products.json";
import { createInventoryRepository } from "../../src/services/inventory-repository.js";
export function freshRepository() {
  const records = new Map();
  const storage = { getItem: (key) => records.get(key) ?? null, setItem: (key, text) => records.set(key, text) };
  return createInventoryRepository({ storage, seed: structuredClone(seed), delay: 0 });
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});
