import { readFile } from "node:fs/promises";

const lock = JSON.parse(await readFile(
  new URL("../inventory/03-tooling/package-lock.json", import.meta.url), "utf8",
));
const entry = lock.packages["node_modules/semver"];
console.log("锁文件格式", lock.lockfileVersion);
console.log("具体版本", entry.version);
console.log("开发依赖", entry.dev);
console.log("来源是 tarball", entry.resolved.endsWith(".tgz"));
console.log("有完整性摘要", entry.integrity.startsWith("sha512-"));
