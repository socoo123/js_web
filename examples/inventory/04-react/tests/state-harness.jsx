import { afterEach, vi } from "vitest";
import { StrictMode, act } from "react";
import { createRoot } from "react-dom/client";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root;
let host;

export async function mount(component) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root.render(<StrictMode>{component}</StrictMode>));
  return host;
}

export async function click(label, scope = host) {
  const button = [...scope.querySelectorAll("button")].find((node) => node.textContent === label);
  if (!button) throw new Error(`缺少按钮：${label}`);
  await act(async () => button.click());
}

export async function advance(ms) {
  await act(async () => vi.advanceTimersByTime(ms));
}

export async function fill(input, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  root = undefined;
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
