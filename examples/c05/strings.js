const rawId = " p001 ";
const cleanId = rawId.trim().toUpperCase();
console.log(cleanId, rawId === " p001 "); // → P001 true
console.log(cleanId.startsWith("P"), cleanId.includes("001")); // → true true
console.log(cleanId.slice(1)); // → 001
console.log(`商品 ${cleanId}，剩余 ${12} 件`); // → 商品 P001，剩余 12 件
console.log("😀".length); // → 2
