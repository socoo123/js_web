import { loadStock } from "./mock-api.js";

Promise.resolve("P002")
  .then(id => {
    return loadStock(id);
  })
  .then(stock => {
    console.log("下一步", stock);
  })
  .catch(error => console.log(error.message));
