const initialState = "尚未提交";
const formData = new FormData();
formData.set("productId", "P002");
async function save(previousState, data) {
  console.log("上次结果", previousState);
  return `收到 ${data.get("productId")}`;
}
const result = await save(initialState, formData);
console.log("本次结果", result);
await save(result, formData);
