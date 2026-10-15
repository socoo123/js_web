{
  const text = '{"id":"KB-001","stock":12}';
  const parsed = JSON.parse(text);
  console.log(typeof text, typeof parsed, parsed.stock);
  console.log(JSON.stringify({ id: "KB-001", note: undefined, stock: NaN }));
  console.log(JSON.stringify([undefined, NaN, Infinity]));
  console.log(JSON.stringify(undefined));
  const dated = { updatedAt: new Date("2026-10-15T01:30:00Z") };
  const restored = JSON.parse(JSON.stringify(dated));
  console.log(restored.updatedAt, typeof restored.updatedAt);
  const first = { stock: 12 };
  const pair = { left: first, right: first };
  const roundTrip = JSON.parse(JSON.stringify(pair));
  console.log(pair.left === pair.right, roundTrip.left === roundTrip.right);
  try {
    JSON.stringify({ stock: 12n });
  } catch (error) {
    console.log("BigInt", error.name);
  }
  const cycle = {};
  cycle.self = cycle;
  try {
    JSON.stringify(cycle);
  } catch (error) {
    console.log("循环", error.name);
  }
}
