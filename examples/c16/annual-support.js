const checks = {
  ES2015: new Map([["stock", 12]]).get("stock") === 12 && typeof Promise === "function",
  ES2016: [12, 0].includes(0) && 2 ** 3 === 8,
  ES2017: Object.entries({ stock: 12 })[0][1] === 12 && await (async () => 12)() === 12,
  ES2018: ({ ...{ stock: 12 } }).stock === 12 && typeof Promise.prototype.finally === "function",
  ES2019: Object.fromEntries([["stock", 12]]).stock === 12 && [1, [2]].flat().length === 2,
  ES2020: (0 ?? 12) === 0 && ({ stock: 0 })?.stock === 0 && typeof BigInt === "function" && typeof Promise.allSettled === "function",
  ES2021: "P001".replaceAll("0", "-") === "P--1" && typeof Promise.any === "function",
  ES2022: [12, 0].at(-1) === 0 && Object.hasOwn({ stock: 0 }, "stock"),
  ES2023: typeof Array.prototype.toSorted === "function" && typeof Array.prototype.toSpliced === "function" && typeof Array.prototype.findLast === "function",
  ES2024: typeof Object.groupBy === "function" && typeof Map.groupBy === "function" && typeof Promise.withResolvers === "function",
  ES2025: typeof Iterator.prototype.map === "function" && typeof Set.prototype.union === "function",
};
for (const [year, usable] of Object.entries(checks)) console.log(year, usable);
