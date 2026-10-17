function subscribe(productId) {
  console.log("setup", productId);
  return () => console.log("cleanup", productId);
}
const stopKeyboard = subscribe("P001");
stopKeyboard();
const stopMouse = subscribe("P002");
stopMouse();
