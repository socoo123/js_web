// 三项虚构自评，只演示如何从证据安排复习
const gaps = [
  { topic: "请求清理", score: 0, next: "重做 C30 快速切换详情" },
  { topic: "对象身份", score: 1, next: "重做 C05 浅复制实验" },
  { topic: "静态路径", score: 2, next: "保留 C46 深层刷新记录" },
];
const pending = gaps.filter((gap) => gap.score < 2)
  .toSorted((a, b) => a.score - b.score);
for (const gap of pending) {
  console.log(gap.topic + "：" + gap.next);
}
console.log("待补", pending.length);
