// @vitest-environment happy-dom
import React from "react";
import { expect, test, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { freshRepository } from "./support.jsx";
import App from "../../src/react/App.jsx";
import ProductEditor from "../../src/react/ProductEditor.jsx";
import seed from "../../data/products.json";

// region blank-stock
test("空库存阻止提交并聚焦，合法的 0 可以保存", async () => {
  const user = userEvent.setup();
  const save = vi.fn().mockResolvedValue(undefined);
  render(<ProductEditor product={structuredClone(seed[1])} onSave={save} onCancel={() => {}} />);
  const stock = screen.getByRole("textbox", { name: "库存", exact: true });
  await user.clear(stock);
  await user.click(screen.getByRole("button", { name: "保存", exact: true }));
  expect(await screen.findByRole("alert")).toHaveTextContent("请输入库存，空白无效");
  expect(stock).toHaveAccessibleDescription("请输入库存，空白无效");
  expect(stock).toHaveFocus();
  expect(save).not.toHaveBeenCalled();
  await user.type(stock, "0");
  await user.click(screen.getByRole("button", { name: "保存", exact: true }));
  expect(await screen.findByText("保存完成")).toBeInTheDocument();
  expect(save).toHaveBeenCalledExactlyOnceWith(seed[1]);
});
// endregion blank-stock

// region creation
test("新建商品后卡片和统计使用同一份已保存数据", async () => {
  const user = userEvent.setup();
  render(<App inventoryRepository={freshRepository()} />);
  await screen.findByRole("heading", { name: "P001 机械键盘", exact: true });
  await user.click(screen.getByRole("button", { name: "新建商品", exact: true }));
  const form = screen.getByRole("form", { name: "商品编辑" });
  await user.type(within(form).getByLabelText("名称", { exact: true }), "随身转接头");
  await user.clear(within(form).getByLabelText("库存", { exact: true }));
  await user.type(within(form).getByLabelText("库存", { exact: true }), "3");
  await user.clear(within(form).getByLabelText("价格（元）", { exact: true }));
  await user.type(within(form).getByLabelText("价格（元）", { exact: true }), "0.29");
  await user.click(within(form).getByRole("button", { name: "保存", exact: true }));
  expect(await screen.findByRole("heading", { name: /随身转接头/ })).toBeInTheDocument();
  expect(screen.getByText("库存 55 / 价值 2634887 分")).toBeInTheDocument();
  expect(screen.queryByRole("form", { name: "商品编辑" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "新建商品", exact: true })).toHaveFocus();
});
// endregion creation

// region retry
test("详情失败后点击重试恢复", async () => {
  const user = userEvent.setup();
  const repository = freshRepository();
  const read = vi.spyOn(repository, "get").mockRejectedValueOnce(new Error("模拟断网"));
  render(<App inventoryRepository={repository} />);
  await user.click(await screen.findByRole("link", { name: "详情 P002", exact: true }));
  const details = screen.getByRole("region", { name: "商品详情", exact: true });
  expect(await within(details).findByRole("alert")).toHaveTextContent("模拟断网");
  await user.click(within(details).getByRole("button", { name: "重试详情", exact: true }));
  expect(await screen.findByText(/P002 无线鼠标.*库存 0/)).toBeInTheDocument();
  expect(within(details).queryByRole("alert")).not.toBeInTheDocument();
  expect(read).toHaveBeenCalledTimes(2);
});
// endregion retry

test("提交失败后草稿保留，重试成功才更新列表和统计", async () => {
  const user = userEvent.setup();
  render(<App inventoryRepository={freshRepository()} />);
  await user.click(await screen.findByRole("button", { name: "编辑 P004", exact: true }));
  const form = screen.getByRole("form", { name: "商品编辑" });
  const stock = within(form).getByLabelText("库存", { exact: true });
  await user.clear(stock); await user.type(stock, "8");
  await user.click(screen.getByRole("checkbox", { name: "模拟保存失败", exact: true }));
  await user.click(within(form).getByRole("button", { name: "保存", exact: true }));
  expect(await within(form).findByRole("alert")).toHaveTextContent("模拟 save 失败");
  expect(stock).toHaveValue("8");
  expect(screen.getByText("库存 52 / 价值 2634800 分")).toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "模拟保存失败", exact: true }));
  await user.click(within(form).getByRole("button", { name: "保存", exact: true }));
  await waitFor(() => expect(screen.queryByRole("form", { name: "商品编辑" })).not.toBeInTheDocument());
  expect(screen.getByText("库存 57 / 价值 2784300 分")).toBeInTheDocument();
});
