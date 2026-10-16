const category = "外设";
function readCategory() {
  return category;
}
function showFromAnotherScope() {
  const category = "配件";
  return readCategory();
}
console.log(showFromAnotherScope()); // → 外设
