const controller = new AbortController();
controller.abort();
console.log(controller.signal.aborted);
for (let attempt = 0; attempt < 2; attempt++) {
  try {
    await fetch('data:application/json,{"id":"P001"}', { signal: controller.signal });
  } catch (error) {
    console.log(error.name);
  }
}
