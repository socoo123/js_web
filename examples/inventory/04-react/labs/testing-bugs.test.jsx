// @vitest-environment happy-dom
import "../tests/rtl-support.jsx";
import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlankStockBroken from "./BlankStockBroken.jsx";

it("清空库存不能被当成合法的 0 保存", async () => {
  const user = userEvent.setup();
  render(<BlankStockBroken />);
  await user.click(screen.getByRole("button", { name: "保存库存" }));
  expect(screen.getByRole("status")).toHaveTextContent("库存无效");
});
