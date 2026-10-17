import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReducerProbe from "./ReducerProbe.jsx";
import ReducerQueue from "./ReducerQueue.jsx";
import { restockReducer as broken } from "./MutationReducerBroken.js";
import { restockReducer as fixed } from "./MutationReducerFixed.js";
import ContextSplitBroken from "./ContextSplitBroken.jsx";
import ContextJoined from "./ContextJoined.jsx";
import ContextScopes, { MissingProvider } from "./ContextScopes.jsx";
import "../src/styles.css";

const cases = { mutation: <ReducerProbe reducer={broken} />, "mutation-answer": <ReducerProbe reducer={fixed} />,
  queue: <ReducerQueue />, split: <ContextSplitBroken />, "split-answer": <ContextJoined />,
  scope: <ContextScopes />, missing: <MissingProvider /> };
const example = cases[new URLSearchParams(location.search).get("case")] ?? cases.queue;
createRoot(document.getElementById("root")).render(<StrictMode><h1>Reducer 与 Context 实验</h1>{example}</StrictMode>);
