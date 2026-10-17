import path from "node:path";

export function parseOptions(args, env) {
  const [input, output, category = "全部", ...extra] = args;
  if (extra.length) throw new Error("用法：node cli.js [输入JSON] [输出文本] [分类]");
  if (!["全部", "外设", "显示器", "配件", "音频"].includes(category)) {
    throw new Error("分类无效");
  }
  const text = env.LOW_STOCK_LIMIT ?? "5";
  const limit = Number(text);
  if (text.trim() === "" || !Number.isInteger(limit) || limit < 0 || limit > 99999) {
    throw new RangeError("LOW_STOCK_LIMIT 须为 0–99999 的整数");
  }
  return {
    source: input === undefined ? new URL("../../shared/products.json", import.meta.url) : path.resolve(input),
    target: output === undefined ? null : path.resolve(output),
    category, limit,
  };
}
