import { describe, it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { createReport } from "../report.js";

describe("报告输入边界", () => {
  it("配件报告使用同一份固定数据", () => {
    const report = createReport(products, { category: "配件" });
    expect(report).toContain("商品种类：2");
    expect(report).toContain("总库存：28 件");
    expect(report).toContain("库存总价值：587200 分（5872.00 元）");
  });

  it("空数组是合法业务输入", () => {
    const report = createReport([]);
    expect(report).toContain("总库存：0 件");
    expect(report).toContain("分类：无");
  });

  it.each([null, undefined, {}])("非数组 %s 抛出错误", rows => {
    expect(() => createReport(rows)).toThrow("商品数据应为数组");
  });

  it.each(["12", -1, 3.8, 100000, NaN])("拒绝非法初始库存 %s", stock => {
    const rows = [{ ...products[0], stock }];
    expect(() => createReport(rows)).toThrow("库存应为 0–99999 的整数");
  });
});
