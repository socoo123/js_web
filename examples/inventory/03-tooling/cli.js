import process from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import { parseOptions } from "./options.js";
import { createReport } from "./report.js";

try {
  const options = parseOptions(process.argv.slice(2), process.env);
  const text = await readFile(options.source, "utf8");
  const report = createReport(JSON.parse(text), options);
  if (options.target !== null) {
    await writeFile(options.target, report, { encoding: "utf8", flag: "wx" });
  }
  process.stdout.write(report);
} catch (error) {
  console.error("报告失败：", error.code ?? error.name, error.message);
  process.exitCode = 1;
}
