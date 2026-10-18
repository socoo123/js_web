const previous = { query: "鼠标", onChoose: (id) => id };
const next = { query: "鼠标", onChoose: (id) => id };
console.log(Object.is(previous.query, next.query));
console.log(Object.is(previous.onChoose, next.onChoose));
console.log(Object.is(previous, next));
