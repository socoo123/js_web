// 有问题的写法：无关备注变化时也重建列表输入。
import { useState } from "react";
import { filterRows } from "./performance-data.js";
import { SlowListView } from "./SlowList.jsx";

export default function PerfBroken({ List = SlowListView }) {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState("");
  const rows = filterRows(query);
  const choose = (id) => setSelected(id);
  return <>
    <label>筛选名称 <input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <label>实验备注 <input value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <p role="status">{rows.length} 行 · 已选 {selected || "尚无"}</p>
    <List rows={rows} onChoose={choose} />
  </>;
}
