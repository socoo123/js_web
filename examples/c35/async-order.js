async function loadMouse() {
  throw new Error("模拟断网");
}
const pending = loadMouse().catch((error) => console.log(error.message));
console.log("已经发起");
await pending;
console.log("已经处理失败");
