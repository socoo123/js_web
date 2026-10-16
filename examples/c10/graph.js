const related = new Map([
  ["外设", ["配件", "音频"]],
  ["配件", ["外设"]],
  ["音频", []],
]);
console.log(related.get("外设").join(", ")); // → 配件, 音频
console.log(related.get("配件").includes("外设")); // → true
