import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
export function loadModule(name) {
  let exported;
  const file = new URL(`../inventory/06-openui5/webapp/model/${name}.js`, import.meta.url);
  runInNewContext(readFileSync(file, "utf8"), {
    sap: { ui: { define: (_dependencies, factory) => { exported = factory(); } } },
  });
  return exported;
}
export const rules = loadModule("productRules");
