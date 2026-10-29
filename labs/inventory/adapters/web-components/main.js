import "./components.js";
import { createShell } from "./shell.js";
import { connectEditor } from "./editor.js";

const shell = await createShell();
connectEditor(shell);
