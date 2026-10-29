import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [lesson, ...args] = process.argv.slice(2);
if (!/^C2[5-8]$/.test(lesson ?? "")) {
  console.error("用法：node tools/forms-state-check.mjs C25（支持 C25–C28）");
  process.exitCode = 1;
} else {
  const workspace = fileURLToPath(new URL("../", import.meta.url));
  const result = spawnSync(process.execPath, [
    "node_modules/vitest/vitest.mjs", "run", "--configLoader", "native", "--config", "tools/forms-state.config.mjs", ...args,
  ], { cwd: workspace, env: { ...process.env, LAB_LESSON: lesson }, stdio: "inherit" });
  if (result.error) console.error(result.error.message);
  process.exitCode = result.status ?? 1;
}
