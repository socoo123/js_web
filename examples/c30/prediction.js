function start(id) {
  let ignore = false;
  return {
    finish() { console.log(id, ignore ? "忽略" : "提交"); },
    cleanup() { ignore = true; },
  };
}
const first = start("P001");
first.cleanup();
const second = start("P002");
second.finish();
first.finish();
