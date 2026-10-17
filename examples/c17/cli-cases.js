import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const stage = path.join(root, "examples/inventory/03-tooling");
const cli = path.join(stage, "cli.js");
const expected = await readFile(new URL("./project-report.expected.txt", import.meta.url), "utf8");
const source = path.join(root, "examples/shared/products.json");
const json = await readFile(source, "utf8");
const directory = await mkdtemp(path.join(tmpdir(), "inventory-c17-"));
const env = { ...process.env };
delete env.LOW_STOCK_LIMIT;
function run(args = [], cwd = stage, extraEnv = {}) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd, env: { ...env, ...extraEnv }, encoding: "utf8", timeout: 5000,
  });
  assert.ifError(result.error);
  return result;
}
function fails(args, code, extraEnv = {}) {
  const result = run(args, directory, extraEnv);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.ok(result.stderr.includes(code), result.stderr);
}
try {
  for (const cwd of [root, stage, directory]) {
    const result = run([], cwd);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, expected);
    assert.equal(result.stderr, "");
  }
  console.log("默认数据：三个启动目录结果一致");
  await writeFile(path.join(directory, "库存 数据.json"), json);
  const relative = run(["库存 数据.json", "报告 结果.txt", "配件"], directory);
  assert.equal(relative.status, 0);
  assert.match(relative.stdout, /总库存：28 件/);
  assert.match(relative.stdout, /库存总价值：587200 分（5872\.00 元）/);
  assert.equal(await readFile(path.join(directory, "报告 结果.txt"), "utf8"), relative.stdout);
  console.log("相对路径：中文空格文件与分类报告正确");
  const disabled = run([], stage, { LOW_STOCK_LIMIT: "0" });
  assert.equal(disabled.status, 0);
  assert.match(disabled.stdout, /低库存（阈值 0 件）：0 种/);
  for (const value of ["", " ", "-1", "3.5", "100000", "无效"]) fails([], "RangeError", { LOW_STOCK_LIMIT: value });
  console.log("环境变量：0 保留，空值、小数与越界被拒绝");
  await writeFile(path.join(directory, "empty.json"), "[]");
  const empty = run(["empty.json"], directory);
  assert.equal(empty.status, 0);
  assert.match(empty.stdout, /总库存：0 件/);
  assert.match(empty.stdout, /分类：无\n标签：无/);
  for (const [name, content, message] of [
    ["bad.json", "{", "SyntaxError"],
    ["shape.json", "{}", "商品数据应为数组"],
    ["stock.json", json.replace('"stock": 12', '"stock": "12"'), "库存应为"],
    ["duplicate.json", JSON.stringify([JSON.parse(json)[0], JSON.parse(json)[0]]), "id 格式错误或重复"],
  ]) {
    await writeFile(path.join(directory, name), content);
    fails([name, "should-not-exist.txt"], message);
    await assert.rejects(access(path.join(directory, "should-not-exist.txt")));
  }
  fails(["missing.json"], "ENOENT");
  fails([source, "nested/report.txt"], "ENOENT");
  fails([source, "out.txt", "未知分类"], "分类无效");
  fails([source, "out.txt", "全部", "多余参数"], "用法");
  console.log("失败分支：文件、JSON、字段、分类、参数均返回非零状态");
  fails(["库存 数据.json", "报告 结果.txt"], "EEXIST");
  fails(["库存 数据.json", "库存 数据.json"], "EEXIST");
  assert.equal(await readFile(path.join(directory, "报告 结果.txt"), "utf8"), relative.stdout);
  assert.equal(await readFile(path.join(directory, "库存 数据.json"), "utf8"), json);
  assert.equal(await readFile(source, "utf8"), json);
  console.log("文件写入：已有文件与输入数据保持原文");
} finally {
  await rm(directory, { recursive: true, force: true });
}
