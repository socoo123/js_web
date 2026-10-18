import { useLocalStorage } from "./useLocalStorage.js";

export default function InventoryNote() {
  const [note, saveNote, error] = useLocalStorage("js_web:inventory:note:v1", "");
  return <aside aria-label="本机备注">
    <label>本机备注 <input value={note} onChange={(event) => saveNote(event.target.value)} /></label>
    <p>备注保存在当前浏览器；商品编辑仍在刷新后恢复。</p>
    {error && <p role="alert">{error}</p>}
  </aside>;
}
