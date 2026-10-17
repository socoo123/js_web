import { validateProducts } from "./validation.js";

const dataUrl = new URL("./products.json", import.meta.url);

export async function fetchProducts(url = dataUrl) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("HTTP " + response.status);
  return validateProducts(await response.json());
}
