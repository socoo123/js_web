console.log(Number("3"));
console.log(Number(""), Number("   "));
console.log(Number(null), Number(undefined));
console.log(Number("3件"), Number("3.5"));
console.log(Number.isNaN("3件"));
console.log(Number.isNaN(Number("3件")));
console.log(Number.parseInt("3.8", 10));
console.log(String(12), typeof String(12));

console.log(Boolean(0), Boolean("0"), Boolean("false"));
console.log(Boolean(""), Boolean(" "));
console.log(Boolean([]), Boolean({}));

console.log(0 || 12, 0 ?? 12);
console.log(false || true, false ?? true);
console.log("" || "未命名", "" ?? "未命名");
console.log(null ?? 12, undefined ?? 12);
console.log(NaN ?? 12);
console.log(3 && "允许售出", 0 && "允许售出");
