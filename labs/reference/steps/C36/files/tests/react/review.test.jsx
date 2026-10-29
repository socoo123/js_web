// @vitest-environment happy-dom
import React from "react";
import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { freshRepository } from "./support.jsx";
import App from "../../src/react/App.jsx";
import { detailOptions } from "../../src/react/query-options.js";
import { createInventoryRepository } from "../../src/services/inventory-repository.js";
import seed from "../../data/products.json";

test("补货后卡片、详情和派生统计一致", async () => {
  const user = userEvent.setup();
  render(<App inventoryRepository={freshRepository()} />);
  await user.click(await screen.findByRole("link", { name: "详情 P002", exact: true }));
  expect(await screen.findByText(/P002 无线鼠标.*库存 0/)).toBeInTheDocument();
  const actions = screen.getByRole("region", { name: "P002 补货操作", exact: true });
  await user.click(within(actions).getByRole("button", { name: "立即补一件", exact: true }));
  expect(await screen.findByText("库存 53 / 价值 2647700 分")).toBeInTheDocument();
  expect(await screen.findByText(/P002 无线鼠标.*库存 1/)).toBeInTheDocument();
});
test("新鲜缓存仍按商品 id 隔离", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  try {
    const repository = freshRepository();
    const first = await client.fetchQuery(detailOptions(repository, "P001"));
    const second = await client.fetchQuery(detailOptions(repository, "P002"));
    expect([first.id, second.id, second.stock]).toEqual(["P001", "P002", 0]);
  } finally { client.clear(); }
});

// region snapshot-protection
test("坏快照不覆盖好数据；损坏后可恢复有效备份并保留原文", async () => {
  const records = new Map();
  const storage = { getItem: (key) => records.get(key) ?? null, setItem: (key, value) => records.set(key, value) };
  const repository = createInventoryRepository({ storage, seed: structuredClone(seed) });
  await repository.saveSnapshot();
  await repository.restock("P004", 5);
  const before = new Map(records);
  await expect(repository.importText('{"version":1,"products":[{"stock":""}]}')).rejects.toThrow();
  expect(records).toEqual(before);
  expect((await repository.get("P004")).stock).toBe(8);
  const key = [...records.keys()].find((name) => !name.endsWith(":backup") && !name.endsWith(":damaged"));
  records.set(key, "{bad");
  await repository.recover();
  expect((await repository.get("P004")).stock).toBe(3);
  expect(records.get(key + ":damaged")).toBe("{bad");
  expect(records.get(key)).toBe(records.get(key + ":backup"));
});
// endregion snapshot-protection
