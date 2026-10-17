console.log("counter 初始化");
const privateName = "库存计数器";
export let visits = 0;
export function visit() { visits += 1; }
export function name() { return privateName; }
