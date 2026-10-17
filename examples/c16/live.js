import { visits, visit, name } from "./counter.js";
import * as counter from "./counter.js";

const snapshot = visits;
visit();
console.log(visits, counter.visits, snapshot); // → 1 1 0
console.log(name()); // → 库存计数器
console.log(typeof globalThis.privateName); // → undefined
console.log(this === undefined); // → true
