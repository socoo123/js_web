import { setTimeout as wait } from "node:timers/promises";

const timerRef = { current: null };
timerRef.current = setTimeout(() => console.log("任务执行"), 0);
clearTimeout(timerRef.current);
timerRef.current = null;
await wait(10);
console.log("任务已取消", timerRef.current);
