// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./rtl-support.jsx";
import MutationFixed from "../labs/MutationFixed.jsx";
import { attachStockProbe } from "../labs/stock-probe.js";
import { fetchProduct } from "../src/product-api.js";
import { products } from "../../../shared/products.js";

afterEach(() => {
  document.querySelectorAll(".c45-stock-probe").forEach((node) => node.remove());
  vi.unstubAllEnvs();
});

describe("交付故障回归", () => {
  it("真实点击补货后立即更新可见库存", async () => {
    render(<MutationFixed />);
    await userEvent.setup().click(screen.getByRole("button", { name: "给键盘补 1 件" }));
    expect(screen.getByRole("status")).toHaveTextContent("库存：13 件");
  });

  it("请求使用项目 base、正确编号并传递取消信号", async () => {
    vi.stubEnv("BASE_URL", "/js_web/");
    const mouse = products.find((product) => product.id === "P002");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(mouse)));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    expect(await fetchProduct("P002", { signal })).toEqual(mouse);
    expect(fetchMock).toHaveBeenCalledWith("/js_web/data/products/P002.json", {
      signal, headers: { Accept: "application/json" },
    });
  });

  it("HTTP 503 先报告状态，不把错误正文当商品", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("服务暂不可用", { status: 503 })));
    await expect(fetchProduct("P002")).rejects.toThrow("HTTP 503");
  });

  it("200 的 HTML 错页仍被 JSON 解析拒绝", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<!doctype html><h1>找不到</h1>")));
    await expect(fetchProduct("P002")).rejects.toBeInstanceOf(SyntaxError);
  });

  it("卸载探针后节点移除，旧监听器不再更新它", () => {
    const target = new EventTarget();
    const dispose = attachStockProbe(target, document);
    const node = document.querySelector(".c45-stock-probe");
    dispose();
    target.dispatchEvent(new Event("c45-stock-probe"));
    expect(node.isConnected).toBe(false);
    expect(node.textContent).toBe("库存探针已挂载");
  });
});
