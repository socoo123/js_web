function showLegacy() {
  console.log(legacy); // → undefined
  if (true) {
    var legacy = 12;
  }
  console.log(legacy); // → 12
}
showLegacy();
