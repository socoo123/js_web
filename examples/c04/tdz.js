const label = "外层";
try {
  console.log(label);
  const label = "内层";
} catch (error) {
  console.log(error.name); // → ReferenceError
}
let pending;
console.log(pending); // → undefined
