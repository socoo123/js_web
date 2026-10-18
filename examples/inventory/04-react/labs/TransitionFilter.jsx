import { useMemo, useState, useTransition } from "react";
import { filterRows } from "./performance-data.js";
import SlowList from "./SlowList.jsx";

export default function TransitionFilter() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [pending, startTransition] = useTransition();
  const rows = useMemo(() => filterRows(query), [query]);
  function handleChange(event) {
    const next = event.target.value;
    setText(next);
    startTransition(() => setQuery(next));
  }
  return <>
    <label>筛选名称 <input value={text} onChange={handleChange} /></label>
    <p role="status">{pending ? "正在更新结果…" : "结果已更新"}</p>
    <p>当前结果：{query || "全部"} · {rows.length} 行 · 已选 {selected || "尚无"}</p>
    <div aria-busy={pending}><SlowList rows={rows} onChoose={setSelected} /></div>
  </>;
}
