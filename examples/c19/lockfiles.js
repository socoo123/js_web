import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

for (const [name, lock] of [
  ["yarn", "yarn.lock"], ["pnpm", "pnpm-lock.yaml"], ["bun", "bun.lock"],
]) {
  const base = new URL(`./${name}-lab/`, import.meta.url);
  const manifest = JSON.parse(await readFile(new URL("package.json", base), "utf8"));
  console.log(name, manifest.dependencies["wrap-ansi"], existsSync(new URL(lock, base)));
}
