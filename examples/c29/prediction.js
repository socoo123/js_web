function createSession(stock) {
  return { read: () => stock, stop: () => console.log("清理库存快照", stock) };
}
const first = createSession(12);
const second = createSession(15);
console.log(first.read(), second.read());
first.stop();
second.stop();
