// @vitest-environment happy-dom
import React from "react";
import { expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { freshRepository } from "./support.jsx";
import { saveProducts, storageKey } from "../../src/services/storage.js";
import App from "../../src/react/App.jsx";
import seed from "../../data/products.json";

test("非法保存抛错以后，主快照与备份原文都不变", () => {
  const records = new Map();
  const storage = { getItem: (key) => records.get(key) ?? null, setItem: (key, raw) => records.set(key, raw) };
  saveProducts(storage, seed);
  saveProducts(storage, seed);
  const before = new Map(records);
  const invalid = seed.map((product) => product.id === "P004" ? { ...product, stock: "8" } : product);
  expect(() => saveProducts(storage, invalid)).toThrow();
  expect(records.get(storageKey)).toBe(before.get(storageKey));
  expect(records).toEqual(before);
});

test("连续输入保留完整条件，清空后回到原库存", async () => {
  const user = userEvent.setup();
  render(<App inventoryRepository={freshRepository()} />);
  await screen.findByRole("heading", { name: "P001 机械键盘", exact: true });
  const search = screen.getByRole("textbox", { name: "搜索", exact: true });
  await user.type(search, "P004");
  expect(search).toHaveValue("P004");
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "P004 USB-C 扩展坞", exact: true })).toBeInTheDocument();
  await user.clear(search);
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
  expect(screen.getByText("库存 52 / 价值 2634800 分")).toBeInTheDocument();
});
