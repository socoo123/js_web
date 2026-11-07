/**
 * 「先猜一猜」遮答案的判定规则，构建插件（markdown-callouts.mjs）与浏览器脚本（scripts/reveal.mjs）共用。
 * 只做纯文本判断，不碰 DOM/hast，便于在 Node 里逐课核对。
 */

const LABEL = /先猜一猜\s*[：:]/;
/** 问号后紧跟这些词，说明作者把答案写在了同一段里。 */
const ANSWER_OPENER = /^(?:答案|不会|不能|不是|不一定|不需要|不应|不用|应是|应该|仍是|仍然|还是|是|能|会|前者|都)/;
/** 问号后是操作说明或补充背景，不是答案。 */
const INSTRUCTION_OPENER = /^(?:在|把|继续|这里|这是|这个|这段|只阅读|只读|可在|可以在|下面|以下|先在|打开|运行|执行|请)/;

/**
 * 问题段里「问号之后的答案」在 text 中的 [start, end)；没有段内答案时返回 null。
 * 结尾以冒号收束的那一句（如「在 Console 执行：」）引出后面的代码，留在答案之外。
 */
export function inlineAnswerRange(text) {
  const label = LABEL.exec(text);
  if (!label) return null;
  const from = label.index + label[0].length;
  const mark = Math.max(text.lastIndexOf('？'), text.lastIndexOf('?'));
  if (mark < from) return null;
  let start = mark + 1;
  while (start < text.length && /\s/.test(text[start])) start++;
  const tail = text.slice(start);
  if (!tail.trim()) return null;
  if (!ANSWER_OPENER.test(tail) && !tail.includes('答案是') && INSTRUCTION_OPENER.test(tail)) return null;
  let end = text.trimEnd().length;
  if (/[：:]$/.test(text.slice(start, end))) {
    const lastStop = Math.max(text.lastIndexOf('。', end - 1), text.lastIndexOf('；', end - 1));
    if (lastStop < start) return null;
    end = lastStop + 1;
  }
  return end > start ? [start, end] : null;
}

/**
 * 代码行里的注释是否写出了运行结果。返回要保留显示的注释前缀长度；-1 表示不遮。
 *
 * - `// → 值`、`# → 值`：保留到箭头，遮后面的值
 * - 整行注释 `// 有问题的写法：说明`：保留标签，遮说明（说明往往就是答案）
 * - 行尾注释：跟在调用或表达式后时遮住（`console.log(x); // 12`、`undo(); // 当前 15`）；
 *   跟在声明或赋值后的是背景说明（`let stock = 12; // P001 …`），保留
 * - 值前的中文短标签（`// 完整输出：1、2`）一并保留，只遮冒号后的值；英文的 `Error:` 不算标签
 */
export function maskedCommentPrefix(codeBefore, comment) {
  const marker = /^(\/\/|#)\s*/.exec(comment);
  if (!marker) return -1;
  const body = comment.slice(marker[0].length);
  const withLabel = (offset) => {
    const label = /^[\u4e00-\u9fff]{1,8}\s*[：:]\s*/.exec(body.slice(offset));
    const keep = label && body.length > offset + label[0].length ? offset + label[0].length : offset;
    return marker[0].length + keep;
  };
  const arrow = /^(?:→|=>)\s*/.exec(body);
  if (arrow) return body.length > arrow[0].length ? withLabel(arrow[0].length) : -1;
  if (!codeBefore.trim()) {
    const label = /^有问题的写法\s*[：:]\s*/.exec(body);
    return label && body.length > label[0].length ? marker[0].length + label[0].length : -1;
  }
  if (!body.trim()) return -1;
  const code = codeBefore.trim();
  if (/^(?:let|const|var)\s/.test(code) || /^[\w$.[\]"'\s]+(?:[+\-*/%]|\*\*|\?\?|\|\||&&)?=(?!=)/.test(code)) return -1;
  return withLabel(0);
}

/** 把猜测与实际输出都去掉空白和常见分隔符再比较，只用于「一致」提示，不判错。 */
export function sameOutput(guess, actual) {
  const normalize = (value) => value.toLowerCase().replace(/[\s,，、;；。.:：/|·"'“”‘’`()（）[\]{}<>《》→\-–—]+/g, '');
  const left = normalize(guess);
  return left.length > 0 && left === normalize(actual);
}
