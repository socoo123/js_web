import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import catalog from '../labs/catalog.json' with { type: 'json' };
import demos from '../labs/demos.json' with { type: 'json' };
import l3 from '../labs/steps/l3.json' with { type: 'json' };
import l1 from '../labs/steps/l1.json' with { type: 'json' };
import { LAB_STEP_IDS } from '../labs/steps/ids.mjs';
import {
  finishAnchor, inlineHtml, lessonTabHref, lessonTabId, normalizeLab, readHref, stepAnchor, validateLab,
} from '../labs/steps/model.mjs';
import { anchorIssue, checkLabSteps, idsModule, loadSteps } from '../scripts/check-lab-steps.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = { catalog, demos: demos.demos, file: 'l3.json' };
const copy = () => structuredClone(l3);
const errorsOf = (data) => validateLab(data, context);
const allLabs = () => loadSteps(repo).map(({ file, data }) => normalizeLab(data, { catalog, demos: demos.demos, file }));

test('L3 步骤数据通过校验，C21–C36 每课 1–3 步且都被「先读」引用', () => {
  assert.deepEqual(errorsOf(l3), []);
  const lab = normalizeLab(l3, context);
  assert.deepEqual(lab.lessons, catalog.lessons.filter((row) => row.labId === 'L3').map((row) => row.lessonId));
  for (const lessonId of lab.lessons) {
    const own = lab.steps.filter((step) => step.lessonId === lessonId);
    assert.ok(own.length >= 1 && own.length <= 3, lessonId);
    assert.equal(own[0].stepId, `l3-${lessonId.toLowerCase()}-1`);
  }
  assert.equal(lab.steps.find((step) => step.stepId === 'l3-c23-1').preview.shot, 'c23/actions');
  assert.deepEqual(lab.finish.map((item) => item.id), ['l3-finish-1', 'l3-finish-2', 'l3-finish-3', 'l3-finish-4', 'l3-finish-5']);
});

test('缺省的文件与检查命令取自 catalog', () => {
  const lab = normalizeLab(l3, context);
  const c26 = lab.steps.find((step) => step.stepId === 'l3-c26-1');
  assert.deepEqual(c26.files, catalog.lessons.find((row) => row.lessonId === 'C26').files);
  assert.deepEqual(c26.check, ['npm run lab -- check C26']);
  assert.equal(lab.steps.find((step) => step.stepId === 'l3-c23-1').lastOfLesson, false);
  assert.equal(lab.steps.find((step) => step.stepId === 'l3-c23-2').lastOfLesson, true);
});

test('五个 Lab 都有数据文件；没有步骤的 Lab 只有目标与收尾', () => {
  const labs = allLabs();
  assert.deepEqual(labs.map((lab) => lab.labId), ['L1', 'L2', 'L3', 'L4', 'L5']);
  for (const lab of labs.filter((item) => item.labId !== 'L3')) {
    assert.deepEqual(lab.steps, [], lab.labId);
    assert.deepEqual(lab.lessons, catalog.lessons.filter((row) => row.labId === lab.labId).map((row) => row.lessonId));
    assert.ok(lab.finish.length >= 4, lab.labId);
    assert.deepEqual(lab.finish.map((item) => item.id), lab.finish.map((_, index) => `${lab.labId.toLowerCase()}-finish-${index + 1}`));
  }
  assert.deepEqual(validateLab(l1, { ...context, file: 'l1.json' }), []);
});

test('没有步骤就省略 steps；空数组和缺目标被拒绝', () => {
  const ctx = { ...context, file: 'l1.json' };
  const empty = { ...structuredClone(l1), steps: [] };
  assert.match(validateLab(empty, ctx).join('\n'), /steps 不能为空/);
  const noGoal = structuredClone(l1);
  delete noGoal.goal.summary;
  assert.ok(validateLab(noGoal, ctx).length > 0);
});

test('课程标签的 id 与链接', () => {
  assert.equal(lessonTabId('C06'), 'c06');
  assert.equal(lessonTabHref('/js_web/', 'L1', 'C06'), '/js_web/labs/l1/#c06');
});

test('生成的 ids.mjs 与步骤数据同步', () => {
  const labs = allLabs();
  assert.equal(readFileSync(path.join(repo, 'labs/steps/ids.mjs'), 'utf8'), idsModule(labs));
  const lab = labs.find((item) => item.labId === 'L3');
  assert.deepEqual(LAB_STEP_IDS.L3, [...lab.steps.map((step) => step.stepId), ...lab.finish.map((item) => item.id)]);
  assert.deepEqual(LAB_STEP_IDS.L1, ['l1-finish-1', 'l1-finish-2', 'l1-finish-3', 'l1-finish-4']);
});

for (const [name, mutate, pattern] of [
  ['stepId 重复', (data) => { data.steps[1].stepId = data.steps[0].stepId; }, /重复|编号/],
  ['stepId 格式错误', (data) => { data.steps[0].stepId = 'c21-1'; }, /格式/],
  ['首步不是 -1', (data) => { data.steps[0].stepId = 'l3-c21-2'; data.steps[1].stepId = 'l3-c21-3'; }, /第 1 步/],
  ['某课没有步骤', (data) => { data.steps = data.steps.filter((step) => step.lessonId !== 'C26'); }, /C26 没有步骤/],
  ['某课没被引用', (data) => { for (const step of data.steps) step.read = step.read.filter((item) => item.lessonId !== 'C26'); }, /C26 没有被任何「先读」引用/],
  ['先读指向后面的课', (data) => { data.steps[0].read[0].lessonId = 'C30'; }, /后面的课/],
  ['先读超过 3 项', (data) => { data.steps[0].read.push({ lessonId: 'C21', anchor: '练习', why: '多一项' }); }, /1–3/],
  ['文件不在 catalog', (data) => { data.steps[0].files = ['src/react/Unknown.jsx']; }, /不在 C21 的改动文件/],
  ['截图 id 格式错误', (data) => { data.steps[4].preview = { shot: 'C23 actions' }; }, /截图 id/],
  ['预览二选一', (data) => { data.steps[4].preview = { shot: 'c23/actions', output: '15' }; }, /二选一/],
  ['收尾编号错误', (data) => { data.finish.items[1].id = 'l3-finish-9'; }, /l3-finish-2/],
  ['未知字段', (data) => { data.steps[0].title_en = 'x'; }, /未知字段/],
  ['正文含内部编号', (data) => { data.steps[0].goal = '按 V03 的要求完成'; }, /内部编号/],
  ['正文含补丁版本号', (data) => { data.steps[0].goal = '安装 19.3.1 后继续'; }, /补丁版本号/],
  ['链接不是站内', (data) => { data.steps[0].actions[0] = '看[这里](https://example.com)'; }, /链接必须/],
]) {
  test(`拒绝：${name}`, () => {
    const data = copy();
    mutate(data);
    const errors = errorsOf(data);
    assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n'));
  });
}

test('锚点必须落在标题上，或是紧贴标题的兼容 <a id>', () => {
  const heading = '<div class="sl-heading-wrapper level-h2"><h2 id="1-用-state">1. 用 state</h2></div>';
  assert.equal(anchorIssue(heading, '1-用-state'), null);
  assert.equal(anchorIssue(`<a id="旧锚点"></a>\n<a id="更旧"></a>\n${heading}`, '旧锚点'), null);
  assert.match(anchorIssue(`<a id="集中的旧锚点"></a>\n<p>正文</p>${heading}`, '集中的旧锚点'), /不在标题上/);
  assert.match(anchorIssue(heading, '不存在的小节'), /不存在/);
});

test('行内文字只渲染代码和站内链接，其余转义', () => {
  assert.equal(inlineHtml('改 `<App />` 并看[起点](#从哪里开始)'), '改 <code>&lt;App /&gt;</code> 并看<a href="#从哪里开始">起点</a>');
  assert.equal(inlineHtml('[规则](/js_web/labs/rules/)', '/base/'), '<a href="/base/labs/rules/">规则</a>');
  assert.equal(inlineHtml('<b>粗</b>'), '&lt;b&gt;粗&lt;/b&gt;');
});

function fakeDist(labs, { drop, bar } = {}) {
  const dist = mkdtempSync(path.join(tmpdir(), 'lab-steps-dist-'));
  const put = (slug, html) => { mkdirSync(path.join(dist, slug), { recursive: true }); writeFileSync(path.join(dist, slug, 'index.html'), html); };
  const pages = new Map();
  const add = (slug, html) => pages.set(slug, [...(pages.get(slug) ?? []), html]);
  for (const lab of labs) {
    for (const step of lab.steps) for (const item of step.read) {
      if (`${item.lessonId}#${item.anchor}` !== drop) add(item.slug, `<div class="sl-heading-wrapper level-h2"><h2 id="${item.anchor}">x</h2></div>`);
    }
    for (const lessonId of lab.lessons) {
      const row = catalog.lessons.find((item) => item.lessonId === lessonId);
      const href = bar?.[lessonId] ?? lessonTabHref('/js_web/', lab.labId, lessonId);
      add(row.slug, `<nav class="lab-bar" data-lab-bar="${lessonId}"><a href="${href}">返回</a></nav>`);
    }
    put(`labs/${lab.labId.toLowerCase()}`, [
      `<ol>${lab.lessons.map((id) => `<li><a href="#${lessonTabId(id)}">${id}</a></li>`).join('')}</ol>`,
      ...lab.lessons.map((id) => `<section id="${lessonTabId(id)}" data-lesson-panel="${id}">${lab.steps.filter((step) => step.lessonId === id).map((step) => (
        `<li id="${stepAnchor(step.stepId)}">${step.read.map((item) => `<a href="${readHref('/js_web/', item, step.stepId)}">读</a>`).join('')}<input data-lab-step-toggle="${step.stepId}"></li>`
      )).join('')}</section>`),
      `<ol id="${finishAnchor(lab.labId)}">${lab.finish.map((item) => `<input data-lab-step-toggle="${item.id}">`).join('')}</ol>`,
    ].join('\n'));
  }
  for (const [slug, parts] of pages) put(slug, parts.join('\n'));
  return dist;
}

function fakeRepo() {
  const root = mkdtempSync(path.join(tmpdir(), 'lab-steps-repo-'));
  const steps = loadSteps(repo).map(({ file }) => `labs/steps/${file}`);
  for (const file of ['labs/catalog.json', 'labs/demos.json', ...steps, 'labs/steps/ids.mjs']) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    cpSync(path.join(repo, file), path.join(root, file));
  }
  return root;
}

test('先红后绿：删掉一个「先读」锚点时检查失败，恢复后通过', () => {
  const labs = allLabs();
  const root = fakeRepo();
  const red = fakeDist(labs, { drop: 'C06#4-闭包函数返回以后绑定仍然可用' });
  const green = fakeDist(labs);
  try {
    const failed = checkLabSteps({ root, dist: red });
    assert.deepEqual(failed.errors, ['l3-c23-1 先读 C06#4-闭包函数返回以后绑定仍然可用：锚点不存在']);
    assert.deepEqual(checkLabSteps({ root, dist: green }).errors, []);
  } finally {
    for (const dir of [root, red, green]) rmSync(dir, { recursive: true, force: true });
  }
});

test('LabBar 没指向本课标签、或 Lab 页少了课程面板时检查失败', () => {
  const labs = allLabs();
  const root = fakeRepo();
  const wrongBar = fakeDist(labs, { bar: { C06: '/js_web/labs/l1/' } });
  const missingPanel = fakeDist(labs);
  const l2 = path.join(missingPanel, 'labs/l2/index.html');
  writeFileSync(l2, readFileSync(l2, 'utf8').replace('data-lesson-panel="C14"', ''));
  try {
    assert.deepEqual(checkLabSteps({ root, dist: wrongBar }).errors, ['C06 的 LabBar 没有链接到本课标签 /js_web/labs/l1/#c06']);
    assert.deepEqual(checkLabSteps({ root, dist: missingPanel }).errors, ['labs/l2 缺少 C14 的标签面板 #c14']);
  } finally {
    for (const dir of [root, wrongBar, missingPanel]) rmSync(dir, { recursive: true, force: true });
  }
});

test('ids.mjs 过期时检查失败，--write 后通过', () => {
  const root = fakeRepo();
  try {
    writeFileSync(path.join(root, 'labs/steps/ids.mjs'), 'export const LAB_STEP_IDS = {};\n');
    assert.match(checkLabSteps({ root, source: true }).errors.join('\n'), /不同步/);
    assert.deepEqual(checkLabSteps({ root, source: true, write: true }).errors, []);
    assert.deepEqual(checkLabSteps({ root, source: true }).errors, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
