import { useLocalStorage } from "../src/useLocalStorage.js";

function Note({ name }) {
  const [text, save, error] = useLocalStorage(`js_web:c31:note:${name}`, "");
  return <section><label>备注 {name} <input value={text} onChange={(event) => save(event.target.value)} /></label>
    {error && <p role="alert">{error}</p>}</section>;
}
export default function StoredNotes() {
  return <><Note name="A" /><Note name="B" /></>;
}
