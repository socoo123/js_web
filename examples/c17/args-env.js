import process from "node:process";

const category = process.argv[2] ?? "全部";
const text = process.env.LOW_STOCK_LIMIT ?? "5";
const limit = Number(text);
if (text.trim() === "" || !Number.isInteger(limit) || limit < 0 || limit > 99999) {
  throw new RangeError("LOW_STOCK_LIMIT 须为 0–99999 的整数");
}
console.log("分类", category);
console.log("阈值", typeof text, limit);
