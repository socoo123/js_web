import { cp, mkdtemp, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = await mkdtemp(path.join(tmpdir(), "js-web-c19-"));
for (const name of ["yarn", "pnpm", "bun"]) {
  const target = path.join(root, name);
  await cp(new URL(`./${name}-lab/`, import.meta.url), target, { recursive: true });
  await cp(new URL("./common/", import.meta.url), target, { recursive: true });
  await copyFile(new URL("../shared/products.json", import.meta.url), path.join(target, "products.json"));
  console.log(`${name}：cd "${target}"`);
}
console.log("每次运行都会生成新副本；按上面的路径进入对应目录。");
