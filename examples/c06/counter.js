function createCounter(start) {
  let count = start ?? 0;
  return function next() {
    count += 1;
    return count;
  };
}
const nextKeyboard = createCounter();
const sameCounter = nextKeyboard;
const nextMouse = createCounter();
console.log(nextKeyboard()); // → 1
console.log(sameCounter());  // → 2
console.log(nextMouse());    // → 1
