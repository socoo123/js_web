const counts = new Map([["P001", 12], ["P002", 0]]);
counts.set("P001", 15);
console.log([...counts.keys()].join(", "));
counts.delete("P001");
counts.set("P001", 15);
console.log([...counts.keys()].join(", "));
console.log(new Set([{ id: "P001" }, { id: "P001" }]).size);
console.log(new Set([0, -0, NaN, NaN]).size);
