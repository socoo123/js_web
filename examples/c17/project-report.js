import { readFile } from "node:fs/promises";
import { createReport } from "../inventory/03-tooling/report.js";

const source = new URL("../shared/products.json", import.meta.url);
const products = JSON.parse(await readFile(source, "utf8"));
process.stdout.write(createReport(products));
