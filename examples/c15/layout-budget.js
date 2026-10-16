const viewport = 768;
const padding = 16;
const gap = 16;
const columns = 2;
const content = viewport - padding * 2;
console.log("内容区", content);
console.log("每列", (content - gap * (columns - 1)) / columns);
console.log("25% 四列含间距", content * 0.25 * 4 + gap * 3);
