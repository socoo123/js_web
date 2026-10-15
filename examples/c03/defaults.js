const savedStock = 0; // P002 无线鼠标，已售罄
console.log(savedStock || 12);
console.log(savedStock ?? 12);

console.log(Boolean("0"), Boolean("false"), Boolean(""));
console.log(Boolean([]), Boolean({}));
