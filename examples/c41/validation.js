import { products } from "../shared/products.js";
import { rules } from "./load-rules.js";
for (const stock of ["0", "", "-1", "3.8", "99999", "100000"]) {
  const result = rules.parseDraft({ ...rules.toDraft(products[1]), stock });
  console.log(JSON.stringify(stock), result.hasErrors, result.value?.stock ?? "拒绝");
}
for (const price of ["129.00", "0", "1.23", "1.234", "", "-1"]) {
  const result = rules.parseDraft({ ...rules.toDraft(products[1]), price });
  console.log(JSON.stringify(price), result.value?.priceCents ?? "拒绝");
}
