import { visits, visit } from "./counter.js";

console.log("入口");
const before = visits;
visit();
console.log(before, visits);
const same = await import("./counter.js");
same.visit();
console.log(visits, same.visits);
