import { readFile } from "node:fs/promises";
import { createReport } from "../inventory/03-tooling/report.js";

const products = JSON.parse(await readFile(new URL("../shared/products.json", import.meta.url), "utf8"));
process.stdout.write(createReport(products));
