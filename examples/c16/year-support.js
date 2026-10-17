const checks = {
  getOrInsert: typeof Map.prototype.getOrInsert,
  getOrInsertComputed: typeof Map.prototype.getOrInsertComputed,
  weakGetOrInsert: typeof WeakMap.prototype.getOrInsert,
  jsonSource: (() => { let source; JSON.parse("123", (key, value, context) => { source = context?.source; return value; }); return source === "123"; })(),
  iteratorConcat: typeof Iterator.concat,
  fromBase64: typeof Uint8Array.fromBase64,
  toBase64: typeof Uint8Array.prototype.toBase64,
  fromHex: typeof Uint8Array.fromHex,
  toHex: typeof Uint8Array.prototype.toHex,
  sumPrecise: typeof Math.sumPrecise,
  isError: typeof Error.isError,
  fromAsync: typeof Array.fromAsync,
};
for (const [name, result] of Object.entries(checks)) console.log(name, result);
