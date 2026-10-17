import { visits, visit } from "./counter.js";

try {
  visits = 9;
} catch (error) {
  console.log(error.name); // → TypeError
}
visit();
console.log(visits); // → 1
