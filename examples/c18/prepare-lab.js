import { cp, mkdir } from "node:fs/promises";

const cache = new URL("./.cache/", import.meta.url);
const target = new URL("install-lab/", cache);
await mkdir(cache, { recursive: true });
try {
  await mkdir(target);
  await cp(new URL("./install-lab/", import.meta.url), target, { recursive: true });
  console.log("已创建 .cache/install-lab；进入该目录执行 npm ci。");
} catch (error) {
  console.error(error.code === "EEXIST"
    ? ".cache/install-lab 已存在，请继续使用已有练习目录。"
    : error.message);
  process.exitCode = 1;
}
