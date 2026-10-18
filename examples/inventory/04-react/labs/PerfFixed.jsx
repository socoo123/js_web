import { useCallback, useMemo, useState } from "react";
import { filterRows } from "./performance-data.js";
import SlowList from "./SlowList.jsx";

export default function PerfFixed() {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState("");
  const rows = useMemo(() => filterRows(query), [query]);
  const choose = useCallback((id) => setSelected(id), []);
  return <>
    <label>筛选名称 <input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <label>实验备注 <input value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <p role="status">{rows.length} 行 · 已选 {selected || "尚无"}</p>
    <SlowList rows={rows} onChoose={choose} />
  </>;
}
