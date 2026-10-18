// @vitest-environment happy-dom
import { it, expect } from "vitest";
import { act } from "react";
import { MemoryRouter, useNavigate, useLocation } from "react-router";
import App from "../src/App.jsx";
import { TestApp } from "./router-harness.jsx";
import { mount, click, fill } from "./state-harness.jsx";
import { controlledLoader, resolveProduct } from "./request-harness.jsx";

const card = (host, id) => [...host.querySelectorAll("article")].find((node) => node.textContent.includes(id));
async function follow(link) {
  await act(async () => { link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })); });
}
function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><output>{location.pathname}{location.search}</output>
    <button onClick={() => navigate(-1)}>历史后退</button>
    <button onClick={() => navigate("/products/P002?q=鼠标")}>去鼠标详情</button>
    <button onClick={() => navigate("/products/P001?q=鼠标")}>去键盘详情</button></>;
}

it("从完整 URL 初始化筛选，修改 URL 保留其他参数，直接刷新可重建", async () => {
  const host = await mount(<MemoryRouter initialEntries={["/products?q=鼠标&category=外设&order=stock"]}>
    <App /><LocationProbe /></MemoryRouter>);
  expect(host.querySelector("input").value).toBe("鼠标");
  expect(host.querySelectorAll("article")).toHaveLength(1);
  expect(card(host, "P002")).toBeDefined();
  await fill(host.querySelector("input"), "键盘");
  const search = new URLSearchParams(host.querySelector("output").textContent.split("?")[1]);
  expect(search.get("q")).toBe("键盘");
  expect(search.get("category")).toBe("外设");
  expect(search.get("order")).toBe("stock");
  expect(card(host, "P001")).toBeDefined();
});

it("非法筛选枚举回退到全部与编号，未匹配结果显示空提示", async () => {
  const host = await mount(<TestApp initialEntries={["/products?category=未知&order=random&q=不存在"]} />);
  expect(host.querySelector('[aria-label="分类"]').value).toBe("全部");
  expect(host.querySelector('[aria-label="排序"]').value).toBe("id");
  expect(host.textContent).toContain("没有匹配的商品");
});

it("直接进入详情参数页显示嵌套内容、初始快照与带筛选的返回链接", async () => {
  const api = controlledLoader();
  const host = await mount(<TestApp initialEntries={["/products/P002?q=鼠标"]} loadProduct={api.load} />);
  expect(host.querySelector('[aria-label="库存导航"]')).not.toBeNull();
  expect(document.activeElement.textContent).toBe("商品详情 P002");
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("无线鼠标 · 外设 · 初始库存 0 件 · ¥129.00");
  expect([...host.querySelectorAll("a")].find((a) => a.textContent === "返回筛选列表").getAttribute("href")).toBe("/products?q=鼠标");
});

it.each(["/missing", "/products/P999", "/products/not-an-id"])("未知地址 %s 显示可返回的不存在页且不发商品请求", async (path) => {
  const api = controlledLoader();
  const host = await mount(<TestApp initialEntries={[path]} loadProduct={api.load} />);
  expect(host.textContent).toContain("页面不存在");
  expect(api.load).not.toHaveBeenCalled();
  await follow([...host.querySelectorAll("a")].find((a) => a.textContent === "返回全部商品"));
  expect(host.querySelectorAll("article")).toHaveLength(6);
});

it("跨路由保留 Provider 商品，返回恢复 URL 筛选，编辑草稿随列表卸载而丢弃", async () => {
  const api = controlledLoader();
  const host = await mount(<TestApp initialEntries={["/products?q=鼠标"]} loadProduct={api.load} />);
  await click("补 1 件", card(host, "P002"));
  await click("编辑", card(host, "P002"));
  await fill(host.querySelector('[name="name"]'), "未保存草稿");
  await follow(card(host, "P002").querySelector("a"));
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("初始库存 0 件");
  await follow([...host.querySelectorAll("a")].find((a) => a.textContent === "返回筛选列表"));
  expect(host.querySelector("input").value).toBe("鼠标");
  expect(card(host, "P002").textContent).toContain("库存：1 件");
  expect(host.textContent).toContain("总库存 53 件");
  expect(host.querySelector("form")).toBeNull();
});

it("详情参数改变时取消旧请求，后退到旧 URL 启动独立请求", async () => {
  const api = controlledLoader();
  const host = await mount(<MemoryRouter initialEntries={["/products/P001?q=鼠标"]}>
    <App loadProduct={api.load} /><LocationProbe /></MemoryRouter>);
  const old = api.latest();
  await click("去鼠标详情");
  expect(old.signal.aborted).toBe(true);
  await resolveProduct(api.latest());
  await resolveProduct(old);
  expect(host.textContent).toContain("详情已加载：P002");
  await click("历史后退");
  expect(host.querySelector("output").textContent).toBe("/products/P001?q=鼠标");
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("详情已加载：P001");
});

it("筛选 replace 不增加历史条目，后退恢复上一次页面", async () => {
  const host = await mount(<MemoryRouter initialEntries={["/missing", "/products"]} initialIndex={1}>
    <App /><LocationProbe /></MemoryRouter>);
  await fill(host.querySelector("input"), "鼠");
  await fill(host.querySelector("input"), "鼠标");
  await click("历史后退");
  expect(host.querySelector("output").textContent).toBe("/missing");
  expect(host.textContent).toContain("页面不存在");
});

it("搜索文本全部保留为搜索词，不当作分类的默认值删除", async () => {
  const host = await mount(<TestApp />);
  await fill(host.querySelector("input"), "全部");
  expect(host.querySelector("input").value).toBe("全部");
  expect(host.textContent).toContain("没有匹配的商品");
  expect(host.querySelectorAll("article")).toHaveLength(0);
});
