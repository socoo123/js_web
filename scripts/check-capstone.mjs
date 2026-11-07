// L6 毕业挑战的数据检查：结构、Node 实际运行预测题与 Bug 代码、按固定数据重算项目验收数字。
// 可选 --base http://127.0.0.1:4412/js_web/ ：请求页面与每个「回看」链接，确认 200 且目标 id 存在。
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AREAS, QUESTIONS } from '../labs/capstone/quiz.mjs';
import { BUGS } from '../labs/capstone/bugs.mjs';
import { CASES, LEVELS, PARTIAL, RUBRIC, START } from '../labs/capstone/project.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const catalog = JSON.parse(readFileSync(path.join(root, 'labs/catalog.json'), 'utf8'));
const products = JSON.parse(readFileSync(path.join(root, 'examples/shared/products.json'), 'utf8'));
const errors = [];
const log = [];
const fail = (message) => errors.push(message);
const lessons = new Map(catalog.lessons.map((lesson) => [lesson.lessonId, lesson]));
const areaIds = new Set(AREAS.map((area) => area.id));

// ---------- 结构 ----------
const ids = new Set();
for (const q of QUESTIONS) {
  if (ids.has(q.id)) fail(`题目 id 重复：${q.id}`);
  ids.add(q.id);
  if (!areaIds.has(q.area)) fail(`${q.id}：领域无效`);
  if (!lessons.has(q.lesson)) fail(`${q.id}：课号无效 ${q.lesson}`);
  if (!['single', 'multi', 'predict'].includes(q.type)) fail(`${q.id}：题型无效`);
  if (q.answer.some((index) => !(index >= 0 && index < q.options.length))) fail(`${q.id}：答案越界`);
  if (q.type !== 'multi' && q.answer.length !== 1) fail(`${q.id}：非多选题只能有一个答案`);
  if (new Set(q.options).size !== q.options.length) fail(`${q.id}：选项重复`);
  if (!q.verify) fail(`${q.id}：缺少 verify`);
}
const byArea = Object.fromEntries(AREAS.map((area) => [area.id, QUESTIONS.filter((q) => q.area === area.id).length]));
if (QUESTIONS.length < 36 || QUESTIONS.length > 45) fail(`题目数应在 36–45：${QUESTIONS.length}`);
for (const [area, count] of Object.entries(byArea)) if (count < 5) fail(`领域 ${area} 只有 ${count} 题`);
log.push(`题目 ${QUESTIONS.length} 道：${AREAS.map((area) => `${area.short} ${byArea[area.id]}`).join('、')}；` +
  `单选 ${QUESTIONS.filter((q) => q.type === 'single').length}、多选 ${QUESTIONS.filter((q) => q.type === 'multi').length}、预测 ${QUESTIONS.filter((q) => q.type === 'predict').length}`);

for (const bug of BUGS) {
  const lines = bug.code.split('\n').length;
  if (lines > 15) fail(`${bug.id}：${lines} 行，超过 15 行`);
  if (!lessons.has(bug.lesson)) fail(`${bug.id}：课号无效`);
  if (!areaIds.has(bug.area)) fail(`${bug.id}：领域无效`);
  if (bug.lines.some((line) => line < 1 || line > lines)) fail(`${bug.id}：答案行越界`);
}
const checkIds = new Set();
for (const level of LEVELS) for (const goal of level.goals) {
  for (const read of goal.read) if (!lessons.has(read.lesson)) fail(`${level.id}.${goal.id}：先读的课号无效 ${read.lesson}`);
  for (const check of goal.checks) {
    const id = `${level.id}.${goal.id}.${check.id}`;
    if (checkIds.has(id)) fail(`验收项 id 重复：${id}`);
    checkIds.add(id);
  }
}
for (const area of AREAS) if (!RUBRIC[area.id]) fail(`自评量表缺少 ${area.id}`);
log.push(`Bug ${BUGS.length} 个；项目验收 ${checkIds.size} 项（${LEVELS.map((level) => `${level.label} ${level.goals.reduce((n, goal) => n + goal.checks.length, 0)}`).join('、')}）`);

// ---------- Node 实际运行 ----------
const work = mkdtempSync(path.join(tmpdir(), 'capstone-'));
function run(files, entry) {
  const dir = mkdtempSync(path.join(work, 'case-'));
  for (const [name, text] of Object.entries(files)) writeFileSync(path.join(dir, name), text);
  try {
    const stdout = execFileSync(process.execPath, [entry], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { stdout: stdout.trimEnd(), stderr: '', code: 0 };
  } catch (error) {
    return { stdout: (error.stdout ?? '').trimEnd(), stderr: error.stderr ?? '', code: error.status };
  }
}
const firstLine = (text) => text.split('\n').find((line) => /\w+Error/.test(line)) ?? '';

let ran = 0;
for (const q of QUESTIONS.filter((item) => item.verify?.run === 'node')) {
  const spec = q.verify;
  const entry = spec.entry ?? `main.${spec.ext ?? 'mjs'}`;
  const files = spec.files ?? { [entry]: `${q.code}\n` };
  const result = run(files, entry);
  ran += 1;
  if (spec.error && !new RegExp(`\\b${spec.error}\\b`).test(result.stderr)) fail(`${q.id}：预期抛出 ${spec.error}，实际 stderr：${firstLine(result.stderr) || '(无)'}`);
  if (spec.stderr && !result.stderr.includes(spec.stderr)) fail(`${q.id}：stderr 缺少「${spec.stderr}」`);
  if (spec.checkOption === false) {
    log.push(`  ${q.id}：${firstLine(result.stderr).trim()}`);
    continue;
  }
  const expected = q.options[q.answer[0]];
  const actual = spec.error ? `${result.stdout}\n抛出 ${spec.error}`.trim() : result.stdout;
  if (actual !== expected) fail(`${q.id}：运行结果与正确选项不一致\n    实际：${JSON.stringify(actual)}\n    选项：${JSON.stringify(expected)}`);
  const clash = q.options.filter((option, index) => index !== q.answer[0] && option === actual);
  if (clash.length) fail(`${q.id}：错误选项与运行结果相同`);
  log.push(`  ${q.id}：${JSON.stringify(actual)}`);
}

for (const bug of BUGS.filter((item) => item.verify?.run === 'node')) {
  const spec = bug.verify;
  const setup = spec.setup ?? '';
  let fixed = bug.code;
  for (const [from, to] of spec.patch) {
    if (!fixed.includes(from)) fail(`${bug.id}：修复补丁找不到「${from}」`);
    fixed = fixed.replace(from, to);
  }
  const buggy = run({ 'main.mjs': `${setup}${bug.code}\n` }, 'main.mjs');
  const good = run({ 'main.mjs': `${setup}${fixed}\n` }, 'main.mjs');
  ran += 2;
  if (spec.buggy !== undefined && buggy.stdout !== spec.buggy) fail(`${bug.id}：有问题版本输出 ${JSON.stringify(buggy.stdout)}，预期 ${JSON.stringify(spec.buggy)}`);
  if (spec.buggyIncludes && !buggy.stdout.includes(spec.buggyIncludes)) fail(`${bug.id}：有问题版本输出缺少「${spec.buggyIncludes}」：${buggy.stdout}`);
  if (good.stdout !== spec.fixed) fail(`${bug.id}：修复版本输出 ${JSON.stringify(good.stdout)}，预期 ${JSON.stringify(spec.fixed)}`);
  const fixLines = bug.fix.split('\n').map((line) => line.trim()).filter(Boolean);
  const patched = fixed.split('\n').map((line) => line.trim());
  if (!fixLines.every((line) => patched.includes(line))) fail(`${bug.id}：页面展示的修复代码与运行的修复版本不一致`);
  log.push(`  ${bug.id}：有问题 ${JSON.stringify(buggy.stdout)} → 修复后 ${JSON.stringify(good.stdout)}`);
}
rmSync(work, { recursive: true, force: true });
log.push(`Node ${process.version} 实际运行 ${ran} 次`);

// ---------- 项目数字 ----------
function plan(list, threshold, target) {
  const check = (value, name) => {
    if (!Number.isInteger(value) || value < 0 || value > 99999) throw new RangeError(`${name}必须是 0–99999 的整数`);
  };
  check(threshold, '阈值');
  check(target, '目标库存');
  if (target <= threshold) throw new RangeError('目标库存必须大于阈值');
  const items = list.filter((p) => p.stock <= threshold).map((p) => ({ id: p.id, name: p.name, from: p.stock, quantity: target - p.stock, costCents: (target - p.stock) * p.priceCents }));
  return { items, quantity: items.reduce((s, i) => s + i.quantity, 0), costCents: items.reduce((s, i) => s + i.costCents, 0) };
}
const summary = (list) => [list.reduce((s, p) => s + p.stock, 0), list.reduce((s, p) => s + p.stock * p.priceCents, 0)];
const apply = (list, items) => list.map((p) => {
  const item = items.find((entry) => entry.id === p.id);
  return item ? { ...p, stock: p.stock + item.quantity } : p;
});
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

if (START.summary !== `库存 ${summary(products)[0]} / 价值 ${summary(products)[1]} 分`) fail(`起点汇总不符：${summary(products)}`);
for (const item of CASES) {
  const label = `${item.threshold}/${item.target}`;
  if (item.error) {
    try {
      plan(products, item.threshold, item.target);
      fail(`${label}：应抛出 RangeError`);
    } catch (error) {
      if (!(error instanceof RangeError) || error.message !== item.error) fail(`${label}：错误不符 ${error.message}`);
    }
    log.push(`  ${label}：RangeError ${item.error}`);
    continue;
  }
  const result = plan(products, item.threshold, item.target);
  const after = summary(apply(products, result.items));
  if (!same(result.items.map((i) => [i.id, i.quantity]), item.items)) fail(`${label}：计划项不符 ${JSON.stringify(result.items.map((i) => [i.id, i.quantity]))}`);
  if (result.items.length !== item.kinds || result.quantity !== item.quantity || result.costCents !== item.costCents) fail(`${label}：合计不符 ${result.items.length}/${result.quantity}/${result.costCents}`);
  if (!same(after, item.after)) fail(`${label}：补货后汇总不符 ${after}`);
  log.push(`  ${label}：${result.items.map((i) => `${i.id}+${i.quantity}`).join(' ')}，${result.items.length} 种 ${result.quantity} 件 ${result.costCents} 分 → ${after.join(' / ')}`);
}
{
  const first = plan(products, 5, 10);
  const afterDone = apply(products, first.items.filter((i) => PARTIAL.done.includes(i.id)));
  const retry = plan(afterDone, 5, 10);
  const final = summary(apply(afterDone, retry.items));
  if (!same(retry.items.map((i) => [i.id, i.quantity]), PARTIAL.remaining) || retry.quantity !== PARTIAL.quantity || retry.costCents !== PARTIAL.costCents) fail(`部分失败重试不符：${JSON.stringify(retry)}`);
  if (!same(final, PARTIAL.after)) fail(`部分失败后最终汇总不符：${final}`);
  log.push(`  部分失败：P002 已补后重算 ${retry.items.map((i) => `${i.id}+${i.quantity}`).join(' ')}，${retry.quantity} 件 ${retry.costCents} 分 → ${final.join(' / ')}`);
}

// 页面上的命令行示例与按固定数据生成的输出逐行一致
{
  const source = readFileSync(path.join(root, 'src/content/docs/labs/l6.mdx'), 'utf8');
  const block = source.match(/<Effect kind="terminal"[^>]*>\s*```text\n([\s\S]*?)```/)?.[1]?.trimEnd();
  const result = plan(products, 5, 10);
  const expected = [
    '$ node src/cli/restock.js 5 10',
    '补货计划：库存 ≤ 5 的商品补到 10 件',
    ...result.items.map((i) => `${i.id} ${i.name} ${i.from} → 10，补 ${i.quantity} 件，${i.costCents} 分`),
    `合计 ${result.items.length} 种、${result.quantity} 件、${result.costCents} 分`,
    '$ node src/cli/restock.js 5 5',
    '无法生成补货计划：目标库存必须大于阈值',
    '$ echo $?',
    '1',
  ].join('\n');
  if (block !== expected) fail(`l6.mdx 的命令行示例与固定数据不一致\n${block}\n---\n${expected}`);
}

// ---------- 可选：线上/本地页面的回看链接 ----------
const baseIndex = process.argv.indexOf('--base');
if (baseIndex > 0) {
  const base = new URL(process.argv[baseIndex + 1]);
  const page = await fetch(new URL('labs/l6/', base));
  if (page.status !== 200) fail(`L6 页面返回 ${page.status}`);
  const html = await page.text();
  const hrefs = [...new Set([...html.matchAll(/href="([^"#]*\/)#([^"]+)"/g)].map((m) => `${m[1]}#${m[2]}`))]
    .filter((href) => href.startsWith(base.pathname));
  const pages = new Map();
  let checked = 0;
  for (const href of hrefs) {
    const [pathname, hash] = href.split('#');
    if (!pages.has(pathname)) {
      const response = await fetch(new URL(pathname, base.origin));
      pages.set(pathname, { status: response.status, html: response.status === 200 ? await response.text() : '' });
    }
    const target = pages.get(pathname);
    const id = decodeURIComponent(hash);
    checked += 1;
    if (target.status !== 200) fail(`${href}：${target.status}`);
    else if (!target.html.includes(`id="${id}"`)) fail(`${href}：页面里没有 id="${id}"`);
  }
  const plainLinks = [...new Set([...html.matchAll(/href="([^"#]+)"/g)].map((m) => m[1]))]
    .filter((href) => href.startsWith(base.pathname) && href.endsWith('/') && !pages.has(href));
  for (const href of plainLinks) {
    const response = await fetch(new URL(href, base.origin));
    if (response.status !== 200) fail(`${href}：${response.status}`);
  }
  log.push(`站内无锚点链接 ${plainLinks.length} 个全部检查状态码`);
  const local = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => decodeURIComponent(m[1]));
  for (const id of new Set(local)) if (!html.includes(`id="${id}"`)) fail(`本页锚点 #${id} 不存在`);
  log.push(`链接：${checked} 个回看/先读链接（${pages.size} 个页面）全部 200 且锚点存在；本页内锚点 ${new Set(local).size} 个`);
}

for (const line of log) console.log(line);
if (errors.length) {
  console.error(`\nL6 检查失败（${errors.length}）：\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log('\nL6 检查通过');
}
