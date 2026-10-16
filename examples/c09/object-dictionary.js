const labels = {};
labels[12] = "数字键";
labels["12"] = "文本键";
console.log(Object.keys(labels).length, labels[12]); // → 1 文本键
console.log(Object.hasOwn(labels, "toString"), typeof labels.toString); // → false function

const counts = { "12": "十二件", "3": "三件", note: "单位：件" };
console.log(Object.keys(counts).join(", ")); // → 3, 12, note
const dictionary = Object.create(null);
dictionary.toString = "自定义标签";
console.log(Object.hasOwn(dictionary, "toString")); // → true
