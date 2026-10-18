import { readStoredText } from "../inventory/04-react/src/storage-text.js";

for (const raw of [null, '"先盘点鼠标"', "broken", "0"]) {
  const storage = { getItem: () => raw };
  try { console.log(readStoredText(storage, "note", "默认备注")); }
  catch (error) { console.log(error.name); }
}
