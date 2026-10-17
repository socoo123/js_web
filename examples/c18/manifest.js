import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(
  new URL("../inventory/03-tooling/package.json", import.meta.url), "utf8",
));
console.log("项目", manifest.name);
console.log("项目版本", manifest.version);
console.log("report", manifest.scripts.report);
console.log("semver 类别", "semver" in manifest.devDependencies ? "开发依赖" : "运行依赖");
