function createReader() {
  let stock = 12;
  const read = () => stock;
  stock = 3;
  return read;
}
const firstReader = createReader();
const secondReader = createReader();
console.log(firstReader());
console.log(firstReader === secondReader);
const aliasReader = firstReader;
console.log(aliasReader === firstReader);
