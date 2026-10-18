import { vi } from "vitest";
import { act } from "react";
import { products } from "../../../shared/products.js";

export function controlledLoader() {
  const calls = [];
  const load = vi.fn((id, { signal } = {}) => new Promise((resolve, reject) => {
    calls.push({ id, signal, resolve, reject });
  }));
  return { load, calls, latest: () => calls.at(-1) };
}

export async function resolveProduct(call) {
  const product = products.find((product) => product.id === call.id);
  await act(async () => { call.resolve(structuredClone(product)); });
}

export async function rejectProduct(call, error = new Error("HTTP 503")) {
  await act(async () => { call.reject(error); });
}
