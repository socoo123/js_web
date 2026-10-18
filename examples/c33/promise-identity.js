const load = () => Promise.resolve({ id: "P001", stock: 12 });
console.log(load() === load());
const productPromise = load();
const read = () => productPromise;
console.log(read() === read());
console.log((await read()).stock);
