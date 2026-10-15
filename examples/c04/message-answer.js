for (const messageStock of [0, 3]) {
  let message;
  if (messageStock === 0) {
    message = "售罄";
  } else {
    message = "可售";
  }
  console.log(messageStock, message); // → 0 售罄 / 3 可售
}
