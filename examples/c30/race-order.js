function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}
const keyboard = deferred();
const mouse = deferred();
let selected = "P001";
let detail = null;
keyboard.promise.then((id) => { detail = id; });
selected = "P002";
mouse.promise.then((id) => { detail = id; });
mouse.resolve("P002");
await mouse.promise;
console.log("当前", selected, "详情", detail);
keyboard.resolve("P001");
await keyboard.promise;
console.log("当前", selected, "详情", detail);
