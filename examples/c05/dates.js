const utcTime = new Date("2026-10-15T01:30:00Z");
const shanghaiTime = new Date("2026-10-15T09:30:00+08:00");
console.log(utcTime.getTime() === shanghaiTime.getTime()); // → true
console.log(shanghaiTime.toISOString()); // → 2026-10-15T01:30:00.000Z
console.log(utcTime.getUTCFullYear(), utcTime.getUTCMonth() + 1, utcTime.getUTCDate());
// → 2026 10 15
const midnight = new Date("2026-10-15T00:30:00+08:00");
console.log(midnight.toISOString().slice(0, 10)); // → 2026-10-14
console.log(Number.isNaN(new Date("not-a-date").getTime())); // → true
