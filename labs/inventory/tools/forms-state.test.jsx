import React from "react";
import { afterEach, describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within, act } from "@testing-library/react";
import seed from "../data/products.json" with { type: "json" };
import App from "../src/react/App.jsx";
import ProductEditor from "../src/react/ProductEditor.jsx";
import StockActions from "../src/react/StockActions.jsx";
import { toDraft, parseDraft, summarize, updateStock } from "../src/core/inventory.js";

const lesson = Number((process.env.LAB_LESSON ?? "C25").slice(1));
afterEach(() => { cleanup(); vi.useRealTimers(); });
const input = (name) => screen.getByRole("textbox", { name, exact: true });
const change = (name, value) => fireEvent.change(input(name), { target: { value } });
const submit = () => fireEvent.submit(screen.getByRole("form", { name: "商品编辑" }));
const edit = (id) => fireEvent.click(screen.getByRole("button", { name: `编辑 ${id}`, exact: true }));
const row = (id) => document.querySelector(`article[data-id="${id}"]`);

describe("C25 当前 ProductEditor 的输入边界", () => {
  test("保留实际前置的连续补货队列：P001 12→15，统计同步", () => {
    render(<App />);
    fireEvent.click(within(row("P001")).getByRole("button", { name: "连续补三件", exact: true }));
    expect(row("P001").textContent).toContain("库存 15 件");
    expect(document.querySelector("#summary").textContent).toContain("库存 55");
    expect(seed[0].stock).toBe(12);
  });

  test("保留实际前置的延时/立即混合队列：12→13→16，不覆盖新库存", () => {
    vi.useFakeTimers(); render(<App />);
    const delay = lesson >= 28 ? 2000 : 3000;
    fireEvent.click(within(row("P001")).getByRole("button", { name: "延迟补三件", exact: true }));
    fireEvent.click(within(row("P001")).getByRole("button", { name: "立即补一件", exact: true }));
    expect(row("P001").textContent).toContain("库存 13 件");
    act(() => vi.advanceTimersByTime(delay - 1));
    expect(row("P001").textContent).toContain("库存 13 件");
    act(() => vi.advanceTimersByTime(1));
    expect(row("P001").textContent).toContain("库存 16 件");
    expect(document.querySelector("#summary").textContent).toContain("库存 56");
    expect(seed[0].stock).toBe(12);
  });

  test.each([
    ["拒绝空名称", "名称", "   ", "name"],
    ["拒绝空库存", "库存", "", "stock"],
    ["拒绝空白库存", "库存", "   ", "stock"],
    ["拒绝负库存", "库存", "-1", "stock"],
    ["拒绝小数库存", "库存", "1.5", "stock"],
    ["拒绝越界库存", "库存", "100000", "stock"],
    ["拒绝三位小数价格", "价格（元）", "129.999", "price"],
    ["拒绝带单位价格", "价格（元）", "3元", "price"],
    ["拒绝负价格", "价格（元）", "-1", "price"],
    ["拒绝空价格", "价格（元）", "", "price"],
  ])("%s", (_title, label, value, field) => {
    const onSave = vi.fn();
    render(<ProductEditor product={structuredClone(seed[1])} onSave={onSave} onCancel={() => {}} />);
    change(label, value); submit();
    expect(onSave).not.toHaveBeenCalled();
    expect(input(label).getAttribute("aria-invalid")).toBe("true");
    const errorId = input(label).getAttribute("aria-describedby");
    expect(errorId).toBe(`error-${field}`);
    expect(document.getElementById(errorId).textContent.length).toBeGreaterThan(0);
    expect(document.activeElement).toBe(input(label));
    expect(seed[1].stock).toBe(0);
  });

  test("0 合法，0.29 元精确保存 29 分且 tags 不丢失", () => {
    const onSave = vi.fn();
    render(<ProductEditor product={structuredClone(seed[3])} onSave={onSave} onCancel={() => {}} />);
    change("名称", "  USB-C 扩展坞  "); change("库存", "0"); change("价格（元）", "0.29"); submit();
    expect(onSave).toHaveBeenCalledWith({ ...seed[3], stock: 0, priceCents: 29 });
    expect(seed[3].stock).toBe(3);
    expect(seed[3].tags).toEqual(["热销", "新品"]);
  });

  test("多项错误聚焦名称而非依赖 core 错误插入顺序", () => {
    const onSave = vi.fn();
    render(<ProductEditor product={structuredClone(seed[1])} onSave={onSave} onCancel={() => {}} />);
    change("名称", " "); change("库存", ""); change("价格（元）", "3元"); submit();
    expect(onSave).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input("名称"));
    for (const label of ["名称", "库存", "价格（元）"]) expect(input(label).getAttribute("aria-invalid")).toBe("true");
  });

  test("取消按钮不是 submit，不保存；输入保持字符串", () => {
    const onSave = vi.fn(), onCancel = vi.fn();
    render(<ProductEditor product={structuredClone(seed[0])} onSave={onSave} onCancel={onCancel} />);
    change("库存", "");
    const cancel = screen.getByRole("button", { name: "取消", exact: true });
    expect(cancel.type).toBe("button"); fireEvent.click(cancel);
    expect(onCancel).toHaveBeenCalledOnce(); expect(onSave).not.toHaveBeenCalled();
    const draft = toDraft(seed[1]);
    expect(typeof draft.stock).toBe("string");
    expect(parseDraft({ ...draft, stock: "" }).hasErrors).toBe(true);
    expect(parseDraft({ ...draft, stock: "0" }).value.stock).toBe(0);
  });

  test("当前 App 中输入不改列表，保存才更新列表与统计", () => {
    render(<App />); edit("P002"); change("库存", "3"); change("价格（元）", "129.90");
    expect(row("P002").textContent).toContain("库存 0 件");
    expect(document.querySelector("#summary").textContent).toContain("库存 52");
    submit();
    expect(screen.queryByRole("form", { name: "商品编辑" })).toBeNull();
    expect(row("P002").textContent).toContain("库存 3 件");
    expect(document.querySelector("#summary").textContent).toContain("库存 55");
    expect(document.querySelector("#summary").textContent).toContain("2673770");
  });

  test.each([["编辑", "12", "P001"], ["新建", "1", "P007"]])(
    "%s遇到全量汇总溢出时显示错误、保留草稿与商品，修正后可重试",
    (mode, stock, id) => {
      const price = "90071992547409.91";
      const parsed = parseDraft({ ...toDraft(seed[0]), stock, price });
      expect(parsed.hasErrors).toBe(false);
      expect(parsed.value.priceCents).toBe(Number.MAX_SAFE_INTEGER);
      render(<App />);
      const summaryBefore = document.querySelector("#summary").textContent;
      const rowBefore = row("P001").textContent;
      if (mode === "编辑") edit("P001");
      else fireEvent.click(screen.getByRole("button", { name: "新建商品", exact: true }));
      change("名称", "汇总边界草稿"); change("库存", stock); change("价格（元）", price);
      expect(() => submit()).not.toThrow();
      expect(screen.getByRole("form", { name: "商品编辑" })).toBeTruthy();
      expect(screen.getByText("汇总超出安全整数范围", { exact: true })).toBeTruthy();
      expect(input("名称").value).toBe("汇总边界草稿");
      expect(input("库存").value).toBe(stock); expect(input("价格（元）").value).toBe(price);
      expect(row("P001").textContent).toBe(rowBefore);
      expect(document.querySelector("#summary").textContent).toBe(summaryBefore);
      expect(document.querySelectorAll("#list article")).toHaveLength(6);
      change("价格（元）", mode === "编辑" ? "399.00" : "0.29"); submit();
      expect(screen.queryByRole("form", { name: "商品编辑" })).toBeNull();
      expect(row(id).textContent).toContain("汇总边界草稿");
      expect(document.querySelector("#summary").textContent).toContain(mode === "编辑" ? "库存 52" : "库存 53");
      expect(seed[0].stock).toBe(12);
    },
  );
});

describe.skipIf(lesson < 26)("C26 当前 App 的编辑身份", () => {
  test("取消 P001 后开 P002 为 0，重新打开 P001 不残留草稿", () => {
    render(<App />); edit("P001"); change("名称", "未保存草稿"); change("库存", "99");
    fireEvent.click(screen.getByRole("button", { name: "取消", exact: true }));
    edit("P002"); expect(input("名称").value).toBe("无线鼠标"); expect(input("库存").value).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "取消", exact: true }));
    edit("P001"); expect(input("名称").value).toBe("机械键盘"); expect(input("库存").value).toBe("12");
    expect(row("P001").textContent).toContain("库存 12 件");
  });

  test("未关闭直接切 P002，草稿和错误同时重置", () => {
    render(<App />); edit("P001"); change("名称", "键盘待盘点"); change("库存", ""); submit();
    edit("P002");
    expect(input("名称").value).toBe("无线鼠标"); expect(input("库存").value).toBe("0");
    expect(input("库存").getAttribute("aria-invalid")).toBe("false");
    expect(row("P001").textContent).toContain("机械键盘");
  });

  test("同一商品重选、排序与筛选保留会话；关闭再开同一商品重置", () => {
    render(<App />); edit("P001"); change("名称", "同一会话");
    edit("P001"); expect(input("名称").value).toBe("同一会话");
    fireEvent.change(screen.getByRole("combobox", { name: "排序", exact: true }), { target: { value: "stock" } });
    expect(input("名称").value).toBe("同一会话");
    fireEvent.change(screen.getByPlaceholderText("名称或编号"), { target: { value: "P002" } });
    expect(row("P001")).toBeNull(); expect(input("名称").value).toBe("同一会话");
    fireEvent.click(screen.getByRole("button", { name: "取消", exact: true }));
    fireEvent.change(screen.getByPlaceholderText("名称或编号"), { target: { value: "" } });
    edit("P001"); expect(input("名称").value).toBe("机械键盘");
  });

  test("删掉当前商品后编辑区消失，不保存旧引用", () => {
    render(<App />); edit("P001"); change("名称", "即将取消");
    fireEvent.click(screen.getByRole("button", { name: "删除 P001", exact: true }));
    expect(screen.queryByRole("form", { name: "商品编辑" })).toBeNull();
    expect(document.querySelector("#summary").textContent).toContain("库存 40");
  });
});

describe.skipIf(lesson < 27)("C27 Provider 只有业务商品来源", () => {
  test("另一商品 dispatch 后当前草稿保留，提交前不进入 products", () => {
    render(<App />); edit("P001"); change("名称", "局部草稿");
    fireEvent.click(within(row("P002")).getByRole("button", { name: "立即补一件", exact: true }));
    expect(input("名称").value).toBe("局部草稿");
    expect(row("P001").textContent).toContain("机械键盘");
    expect(row("P002").textContent).toContain("库存 1 件");
    expect(document.querySelector("#summary").textContent).toContain("库存 53");
  });
});

describe.skipIf(lesson < 28)("C28 当前工作文件的 ref 与外部句柄", () => {
  function StockHarness() {
    const [products, setProducts] = React.useState(() => structuredClone(seed));
    return <StockActions product={products[0]} onRestock={(id, amount) => setProducts((previous) =>
      updateStock(previous, id, previous.find((product) => product.id === id).stock + amount))} />;
  }
  const click = (name) => fireEvent.click(screen.getByRole("button", { name, exact: true }));
  const advance = (milliseconds) => act(() => vi.advanceTimersByTime(milliseconds));

  test("等待状态重新渲染后仍能取消，取消后不再补货", () => {
    vi.useFakeTimers(); render(<StockHarness />);
    click("延迟补三件"); click("立即补一件"); click("取消盘点"); advance(2100);
    expect(screen.getByRole("status").textContent).toContain("13 件");
    expect(screen.queryByText("盘点等待中")).toBeNull();
  });

  test("重新安排取消旧截止时间，只保留新任务", () => {
    vi.useFakeTimers(); render(<StockHarness />);
    click("延迟补三件"); advance(1000); click("延迟补三件"); advance(1000);
    expect(screen.getByRole("status").textContent).toContain("12 件");
    advance(1000); expect(screen.getByRole("status").textContent).toContain("15 件");
  });

  test("移除补货组件会撤销任务，不调用父层业务回调", () => {
    vi.useFakeTimers(); const onRestock = vi.fn();
    const { unmount } = render(<StockActions product={seed[0]} onRestock={onRestock} />);
    click("延迟补三件"); unmount(); advance(2100);
    expect(onRestock).not.toHaveBeenCalled();
  });

  test("保存与取消回打开按钮，筛选移除按钮时回持续存在的标题", () => {
    render(<App />); const button = screen.getByRole("button", { name: "编辑 P004", exact: true });
    edit("P004"); expect(document.activeElement).toBe(input("名称"));
    change("库存", "8"); submit(); expect(document.activeElement).toBe(button);
    edit("P004"); click("取消"); expect(document.activeElement).toBe(button);
    edit("P004"); fireEvent.change(screen.getByPlaceholderText("名称或编号"), { target: { value: "P001" } });
    click("取消"); expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 }));
  });

  test("保存改名后移出搜索，焦点不丢到 body", () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("名称或编号"), { target: { value: "鼠标" } });
    edit("P002"); change("名称", "办公指针"); submit();
    expect(row("P002")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 }));
  });

  test("页内闭包预测只改变容器，不污染业务库存", () => {
    const ref = { current: 12 }; const read = () => ref.current; ref.current += 3;
    expect(read()).toBe(15); expect(seed[0].stock).toBe(12);
    expect(summarize(seed).stock).toBe(52);
  });
});
