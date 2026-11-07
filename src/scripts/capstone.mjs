// L6 毕业挑战的浏览器交互。本页所有记录放在一个 localStorage 键里，与课程进度（js_web:progress:v1）互不影响。
// 没有这段脚本时页面仍可阅读：选项和代码行是普通文本，答案在原生 <details> 里。

const KEY = 'js-web-capstone-v1';
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const empty = () => ({ version: 1, quiz: {}, bugs: {}, checks: {}, rubric: {}, updatedAt: null });
const plainObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!data || data.version !== 1) return empty();
    return {
      ...empty(),
      quiz: plainObject(data.quiz),
      bugs: plainObject(data.bugs),
      checks: plainObject(data.checks),
      rubric: plainObject(data.rubric),
      updatedAt: data.updatedAt ?? null,
    };
  } catch {
    return empty();
  }
}

let state = read();
const views = [];

function render() {
  for (const view of views) view();
}

function commit() {
  state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 存储不可用（隐私模式、配额已满）时，记录只在这次打开的页面里生效。
  }
  render();
}

window.addEventListener('storage', (event) => {
  if (event.key !== KEY && event.key !== null) return;
  state = read();
  render();
});

const $ = (root, selector) => root.querySelector(selector);
const $$ = (root, selector) => [...root.querySelectorAll(selector)];
const letters = (indexes) => indexes.map((index) => LETTERS[index]).join('、');
const sameSet = (a, b) => a.length === b.length && a.every((item) => b.includes(item));
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fill(bar, ratio, tone) {
  if (!bar) return;
  bar.style.setProperty('--cap-fill', `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`);
  if (tone) bar.dataset.tone = tone;
  else if (bar.dataset.fixedTone === undefined) delete bar.dataset.tone;
}

function statusNode(tone, text) {
  const node = document.createElement('span');
  node.className = 'js-status';
  node.dataset.tone = tone;
  node.textContent = text;
  return node;
}

function setFeedback(box, tone, title, detail = '', detailHtml = false) {
  box.replaceChildren(statusNode(tone, title));
  if (detail) {
    const extra = document.createElement('span');
    extra.className = 'cap-feedback-detail';
    if (detailHtml) extra.innerHTML = detail;
    else extra.textContent = detail;
    box.append(extra);
  }
  box.hidden = false;
}

/** 把静态的 span 换成 button，保留类名、data-* 与子节点。 */
function upgrade(element) {
  const button = document.createElement('button');
  button.type = 'button';
  for (const { name, value } of element.attributes) button.setAttribute(name, value);
  button.append(...element.childNodes);
  element.replaceWith(button);
  return button;
}

/** 清除类操作点两次才生效：第一次把按钮变成确认态，5 秒内再点才执行。 */
function confirmButton(button, label, action) {
  const original = button.textContent;
  let timer;
  const reset = () => {
    clearTimeout(timer);
    delete button.dataset.confirm;
    button.textContent = original;
  };
  button.addEventListener('click', () => {
    if (button.dataset.confirm === undefined) {
      button.dataset.confirm = '';
      button.textContent = `再点一次，确认${label}`;
      timer = setTimeout(reset, 5000);
      return;
    }
    reset();
    action();
  });
  button.addEventListener('blur', reset);
}

function scrollToItem(element, focusTarget) {
  element.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  focusTarget?.focus({ preventScroll: true });
}

// ---------- 第一关：能力自测 ----------
function quizItems(root) {
  return $$(root, '[data-qid]').map((article) => ({
    article,
    id: article.dataset.qid,
    number: Number(article.dataset.number),
    area: article.dataset.area,
    type: article.dataset.type,
    answer: article.dataset.answer.split(',').map(Number),
    review: $(article, '[data-review]'),
    prompt: $(article, '[data-prompt]')?.textContent.trim() ?? '',
  }));
}

function initQuiz(root) {
  const live = $(root, '[data-live]');
  const items = quizItems(root).map((item) => {
    const options = $$(item.article, '.cap-opt').map((span) => {
      const button = upgrade(span);
      if (item.type === 'multi') button.setAttribute('aria-pressed', 'false');
      return button;
    });
    return {
      ...item,
      options,
      list: $(item.article, '[data-options]'),
      actions: $(item.article, '.cap-q-actions'),
      submit: $(item.article, '[data-submit]'),
      giveup: $(item.article, '[data-giveup]'),
      feedback: $(item.article, '[data-feedback]'),
      explain: $(item.article, '[data-explain]'),
      badge: $(item.article, '[data-q-state]'),
      wasDone: false,
      fresh: false,
    };
  });

  function answer(item, picked) {
    const correct = picked.length > 0 && sameSet(picked, item.answer);
    state.quiz[item.id] = { picked, correct, at: Date.now() };
    item.fresh = true;
    commit();
    live.textContent = picked.length === 0
      ? `第 ${item.number} 题：答案是 ${letters(item.answer)}，已放进错题本`
      : correct ? `第 ${item.number} 题回答正确` : `第 ${item.number} 题答错了，正确答案是 ${letters(item.answer)}`;
  }

  for (const item of items) {
    item.options.forEach((button, index) => {
      button.addEventListener('click', () => {
        if (state.quiz[item.id]) return;
        if (item.type !== 'multi') {
          answer(item, [index]);
          return;
        }
        button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
        item.submit.disabled = !item.options.some((option) => option.getAttribute('aria-pressed') === 'true');
      });
    });
    item.submit?.addEventListener('click', () => {
      const picked = item.options.flatMap((option, index) => (option.getAttribute('aria-pressed') === 'true' ? [index] : []));
      if (picked.length && !state.quiz[item.id]) answer(item, picked);
    });
    item.giveup.addEventListener('click', () => {
      if (!state.quiz[item.id]) answer(item, []);
    });
  }

  function paint(item) {
    const record = state.quiz[item.id];
    const done = Boolean(record);
    item.list.toggleAttribute('data-done', done);
    item.actions.hidden = done;
    item.explain.hidden = !done;
    if (!done && item.explain.open) item.explain.open = false;

    item.options.forEach((button, index) => {
      const mark = $(button, '[data-mark]');
      mark.replaceChildren();
      delete button.dataset.state;
      if (!done) {
        button.removeAttribute('aria-disabled');
        if (item.type === 'multi' && item.wasDone) button.setAttribute('aria-pressed', 'false');
        return;
      }
      button.setAttribute('aria-disabled', 'true');
      const isAnswer = item.answer.includes(index);
      const isPicked = record.picked.includes(index);
      if (item.type === 'multi') button.setAttribute('aria-pressed', String(isPicked));
      if (isAnswer && isPicked) {
        button.dataset.state = 'correct';
        mark.append(statusNode('ok', '你选对了'));
      } else if (isAnswer) {
        const missed = item.type === 'multi' && record.picked.length > 0;
        button.dataset.state = missed ? 'missed' : 'correct';
        mark.append(statusNode(missed ? 'warn' : 'ok', missed ? '漏选' : '正确答案'));
      } else if (isPicked) {
        button.dataset.state = 'wrong';
        mark.append(statusNode('err', item.type === 'multi' ? '不该选' : '你的选择'));
      }
    });
    if (item.submit && !done && item.wasDone) item.submit.disabled = true;

    item.badge.replaceChildren();
    if (!done) {
      item.feedback.hidden = true;
    } else if (record.correct) {
      setFeedback(item.feedback, 'ok', '回答正确', '解析里有原因和回看链接。');
      item.badge.append(statusNode('ok', '答对'));
    } else if (record.picked.length === 0) {
      setFeedback(item.feedback, 'warn', `答案是 ${letters(item.answer)}`, '这题记为未答对，已放进错题本。读完解析可以回看课文。');
      item.badge.append(statusNode('warn', '看了答案'));
    } else {
      setFeedback(item.feedback, 'err', '答错了', `正确答案是 ${letters(item.answer)}。看看下面的解析，再回看课文。`);
      item.badge.append(statusNode('err', '答错'));
    }
    if (done && item.fresh) item.explain.open = true;
    item.fresh = false;
    item.wasDone = done;
  }

  const top = $(root, '[data-quiz-progress]');
  const score = $(root, '[data-quiz-score]');
  const wrongWrap = $(score, '[data-wrong-wrap]');
  const wrongList = $(score, '[data-wrong]');
  const redoWrong = $(score, '[data-redo-wrong]');
  const redoAll = $(score, '[data-redo-all]');

  function paintScore() {
    const total = items.length;
    const answered = items.filter((item) => state.quiz[item.id]);
    const correct = answered.filter((item) => state.quiz[item.id].correct);
    const wrong = answered.filter((item) => !state.quiz[item.id].correct);

    $(top, '[data-answered]').textContent = answered.length;
    $(top, '[data-correct]').textContent = correct.length;
    fill($(top, '.cap-bar'), answered.length / total);

    $(score, '[data-score-total]').textContent = `${correct.length} / ${total}`;
    $(score, '[data-score-note]').textContent = answered.length === 0
      ? '还没有作答'
      : answered.length < total
        ? `已答 ${answered.length} 题，还剩 ${total - answered.length} 题`
        : `全部答完，正确率 ${Math.round((correct.length / total) * 100)}%`;

    for (const row of $$(score, '[data-area-row]')) {
      const own = items.filter((item) => item.area === row.dataset.areaRow);
      const ownAnswered = own.filter((item) => state.quiz[item.id]).length;
      const ownCorrect = own.filter((item) => state.quiz[item.id]?.correct).length;
      const rate = ownAnswered ? ownCorrect / ownAnswered : 0;
      $(row, '[data-count]').textContent = `${ownCorrect} / ${own.length}`;
      fill($(row, '.cap-bar'), ownCorrect / own.length, ownAnswered === 0 ? null : rate >= 0.8 ? 'ok' : rate >= 0.5 ? 'warn' : 'err');
    }

    wrongList.replaceChildren(...wrong.map((item) => {
      const li = document.createElement('li');
      const head = document.createElement('span');
      const jump = document.createElement('a');
      jump.href = `#q-${item.id}`;
      jump.textContent = `第 ${item.number} 题`;
      const text = item.prompt.length > 46 ? `${item.prompt.slice(0, 46)}…` : item.prompt;
      head.append(jump, ` · ${text}`);
      const back = document.createElement('span');
      back.className = 'cap-review';
      const label = document.createElement('span');
      label.className = 'cap-review-label';
      label.textContent = '回看';
      back.append(label, item.review.cloneNode(true));
      li.append(head, back);
      return li;
    }));
    wrongWrap.hidden = wrong.length === 0;
    redoWrong.disabled = wrong.length === 0;
    redoWrong.textContent = wrong.length ? `重做错题（${wrong.length}）` : '重做错题';
    redoAll.disabled = answered.length === 0;
  }

  redoWrong.addEventListener('click', () => {
    const wrong = items.filter((item) => state.quiz[item.id] && !state.quiz[item.id].correct);
    if (!wrong.length) return;
    for (const item of wrong) delete state.quiz[item.id];
    commit();
    live.textContent = `已清除 ${wrong.length} 道错题的记录，可以重新作答`;
    scrollToItem(wrong[0].article, wrong[0].options[0]);
  });

  confirmButton(redoAll, '全部重做', () => {
    state.quiz = {};
    commit();
    live.textContent = '第一关的作答记录已清除';
    scrollToItem(items[0].article, items[0].options[0]);
  });

  views.push(() => {
    for (const item of items) paint(item);
    paintScore();
  });
}

// ---------- 第二关：Bug 猎人 ----------
function bugItems(root) {
  return $$(root, '[data-bug]').map((article) => ({
    article,
    id: article.dataset.bug,
    number: Number(article.dataset.number),
    area: article.dataset.area,
    lines: article.dataset.lines.split(',').map(Number),
    review: $(article, '[data-review]'),
  }));
}

const LINE_STATE_TEXT = { found: '（找到的根源）', miss: '（已排除）', answer: '（答案）' };

function initBugs(root) {
  const live = $(root, '[data-live]');
  const items = bugItems(root).map((item) => {
    const group = $(item.article, '[data-code-lines]');
    const buttons = $$(group, '.cap-line').map((span, index) => {
      const button = upgrade(span);
      const label = document.createElement('span');
      label.className = 'js-visually-hidden';
      label.textContent = `第 ${index + 1} 行：`;
      const suffix = document.createElement('span');
      suffix.className = 'js-visually-hidden';
      suffix.dataset.srState = '';
      button.prepend(label);
      button.append(suffix);
      button.tabIndex = index === 0 ? 0 : -1;
      return button;
    });
    return {
      ...item,
      group,
      buttons,
      decoys: JSON.parse(item.article.dataset.decoys || '{}'),
      hintButton: $(item.article, '[data-hint-button]'),
      hint: $(item.article, '[data-hint]'),
      attempts: $(item.article, '[data-attempts]'),
      feedback: $(item.article, '[data-feedback]'),
      explain: $(item.article, '[data-explain]'),
      badge: $(item.article, '[data-bug-state]'),
      fresh: false,
    };
  });

  const recordFor = (item) => (state.bugs[item.id] ??= { attempts: 0, misses: [], found: false, hint: false, revealed: false });

  function focusLine(item, index) {
    item.buttons.forEach((button, k) => { button.tabIndex = k === index ? 0 : -1; });
    item.buttons[index].focus();
  }

  for (const item of items) {
    item.buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        item.buttons.forEach((other, k) => { other.tabIndex = k === index ? 0 : -1; });
        const line = index + 1;
        const record = recordFor(item);
        if (record.found) return;
        if (item.lines.includes(line)) {
          record.found = true;
          record.line = line;
          item.fresh = true;
          live.textContent = `Bug ${item.number}：找到了，是第 ${line} 行`;
        } else {
          record.attempts += 1;
          if (!record.misses.includes(line)) record.misses.push(line);
          live.textContent = `Bug ${item.number}：第 ${line} 行不是根源`;
        }
        commit();
      });
    });

    item.group.addEventListener('keydown', (event) => {
      const index = item.buttons.indexOf(document.activeElement);
      if (index < 0) return;
      const last = item.buttons.length - 1;
      const next = { ArrowDown: Math.min(last, index + 1), ArrowUp: Math.max(0, index - 1), Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      focusLine(item, next);
    });

    item.hintButton.addEventListener('click', () => {
      recordFor(item).hint = true;
      commit();
      live.textContent = `提示：${item.hint.textContent.replace(/^提示：/, '')}`;
    });

    item.explain.addEventListener('toggle', () => {
      if (!item.explain.open) return;
      const record = recordFor(item);
      if (record.found || record.revealed) return;
      record.revealed = true;
      commit();
      live.textContent = `Bug ${item.number}：已显示答案，第 ${item.lines.join('、')} 行`;
    });
  }

  function paint(item) {
    const record = state.bugs[item.id];
    item.buttons.forEach((button, index) => {
      const line = index + 1;
      let mark = '';
      if (record?.found && item.lines.includes(line)) mark = 'found';
      else if (record?.revealed && item.lines.includes(line)) mark = 'answer';
      else if (!record?.found && record?.misses?.includes(line)) mark = 'miss';
      if (mark) button.dataset.state = mark;
      else delete button.dataset.state;
      $(button, '[data-sr-state]').textContent = LINE_STATE_TEXT[mark] ?? '';
    });

    item.hint.hidden = !record?.hint;
    item.hintButton.hidden = Boolean(record?.hint || record?.found);
    const tries = record ? record.attempts + (record.found ? 1 : 0) : 0;
    item.attempts.textContent = tries ? `已点 ${tries} 次` : '';

    item.badge.replaceChildren();
    if (record?.found) {
      const solo = !record.hint && !record.revealed;
      const how = record.revealed ? '看过答案后点中。' : record.hint ? '用了提示。' : '';
      setFeedback(item.feedback, 'ok', `找到了：第 ${record.line} 行`, `${how}下面是现象、原因和修复后的代码。`);
      item.badge.append(statusNode('ok', solo ? '独立找到' : '找到'));
    } else if (record?.revealed) {
      setFeedback(item.feedback, 'warn', `答案是第 ${item.lines.join('、')} 行`, '这一个不计入「独立找到」。');
      item.badge.append(statusNode('warn', '看了答案'));
    } else if (record?.misses?.length) {
      const line = record.misses.at(-1);
      const tip = item.decoys[line] ?? '这一行不是根源。对照现象想一想：是哪一步让结果变成了这样？';
      const more = record.attempts >= 2 && !record.hint ? ' 卡住了可以先看提示。' : '';
      setFeedback(item.feedback, 'err', `不是第 ${line} 行`, tip + more, true);
    } else {
      item.feedback.hidden = true;
    }
    if (!record && item.explain.open) item.explain.open = false;
    if (record?.found && item.fresh) item.explain.open = true;
    item.fresh = false;
  }

  const tally = $(root, '[data-bug-tally]');
  const reset = $(tally, '[data-bugs-reset]');

  function paintTally() {
    const records = items.map((item) => state.bugs[item.id]).filter(Boolean);
    const found = records.filter((record) => record.found);
    const solo = found.filter((record) => !record.hint && !record.revealed).length;
    const hinted = records.filter((record) => record.hint).length;
    const revealed = records.filter((record) => record.revealed).length;
    $(tally, '[data-found]').textContent = found.length;
    $(tally, '[data-bug-note]').textContent = records.length
      ? `独立找到 ${solo} 个 · 用了提示 ${hinted} 个 · 看了答案 ${revealed} 个`
      : '还没有开始';
    fill($(tally, '.cap-bar'), found.length / items.length, 'ok');
    reset.disabled = records.length === 0;
  }

  confirmButton(reset, '重新开始', () => {
    state.bugs = {};
    commit();
    live.textContent = '第二关的记录已清除';
    scrollToItem(items[0].article, items[0].buttons[0]);
  });

  views.push(() => {
    for (const item of items) paint(item);
    paintTally();
  });
}

// ---------- 第三关：验收勾选与自评 ----------
function initProject() {
  const inputs = $$(document, '[data-cap-level] [data-check]');
  for (const input of inputs) {
    input.addEventListener('change', () => {
      if (input.checked) state.checks[input.dataset.check] = true;
      else delete state.checks[input.dataset.check];
      commit();
    });
  }
  views.push(() => {
    for (const input of inputs) input.checked = Boolean(state.checks[input.dataset.check]);
    for (const level of $$(document, '[data-cap-level]')) {
      const boxes = $$(level, '[data-check]');
      const done = boxes.filter((box) => box.checked).length;
      $(level, '[data-level-count]').textContent = `已勾 ${done} / ${boxes.length}`;
      fill($(level, '.cap-bar'), boxes.length ? done / boxes.length : 0, 'ok');
      for (const goal of $$(level, '[data-goal]')) {
        const complete = $$(goal, '[data-check]').every((box) => box.checked);
        goal.toggleAttribute('data-complete', complete);
        $(goal, '[data-goal-done]').hidden = !complete;
      }
    }
  });
}

function initRubric(root) {
  const inputs = $$(root, '[data-rubric]');
  const reset = $(root, '[data-rubric-reset]');
  for (const input of inputs) {
    input.addEventListener('change', () => {
      if (input.checked) state.rubric[input.dataset.rubric] = Number(input.value);
      commit();
    });
  }
  confirmButton(reset, '清除自评', () => {
    state.rubric = {};
    commit();
  });
  views.push(() => {
    for (const input of inputs) input.checked = state.rubric[input.dataset.rubric] === Number(input.value);
    reset.disabled = Object.keys(state.rubric).length === 0;
  });
}

// ---------- 总览与毕业报告 ----------
function projectTotals() {
  const boxes = $$(document, '[data-cap-level] [data-check]');
  const levels = $$(document, '[data-cap-level]').map((level) => {
    const own = $$(level, '[data-check]');
    return {
      label: $(level, '.cap-level-tag')?.textContent ?? level.dataset.capLevel,
      done: own.filter((box) => state.checks[box.dataset.check]).length,
      total: own.length,
    };
  });
  return { done: boxes.filter((box) => state.checks[box.dataset.check]).length, total: boxes.length, levels };
}

function initOverview(root) {
  const quiz = quizItems(document);
  const bugs = bugItems(document);
  views.push(() => {
    const answered = quiz.filter((item) => state.quiz[item.id]).length;
    const correct = quiz.filter((item) => state.quiz[item.id]?.correct).length;
    const found = bugs.filter((item) => state.bugs[item.id]?.found).length;
    const project = projectTotals();
    const cards = {
      quiz: [answered ? `已答 ${answered} / ${quiz.length} · 答对 ${correct}` : `共 ${quiz.length} 题`, quiz.length ? answered / quiz.length : 0],
      bugs: [Object.keys(state.bugs).length ? `找到 ${found} / ${bugs.length}` : `共 ${bugs.length} 个`, bugs.length ? found / bugs.length : 0],
      project: [project.done ? `验收已勾 ${project.done} / ${project.total}` : `共 ${project.total} 项验收`, project.total ? project.done / project.total : 0],
    };
    for (const [key, [text, ratio]] of Object.entries(cards)) {
      const card = $(root, `[data-ov="${key}"]`);
      if (!card) continue;
      $(card, '[data-ov-status]').textContent = text;
      fill($(card, '.cap-bar'), ratio, ratio >= 1 ? 'ok' : null);
    }
  });
}

function initSummary(root) {
  const quiz = quizItems(document);
  const bugs = bugItems(document);
  const live = $(root, '[data-live]');
  const list = $(root, '[data-weak]');
  const intro = $(root, '[data-weak-intro]');
  const reset = $(root, '[data-reset-all]');
  const rows = $$(list, ':scope > li[data-area]');

  confirmButton(reset, '清除全部记录', () => {
    state = empty();
    commit();
    live.textContent = '本页的全部记录已清除';
  });

  views.push(() => {
    const answered = quiz.filter((item) => state.quiz[item.id]);
    const correct = answered.filter((item) => state.quiz[item.id].correct);
    const quizCard = $(root, '[data-sum="quiz"]');
    $(quizCard, '[data-sum-value]').textContent = answered.length ? `${correct.length} / ${quiz.length}` : '—';
    $(quizCard, '[data-sum-note]').textContent = answered.length
      ? `已答 ${answered.length} 题，答对率 ${Math.round((correct.length / answered.length) * 100)}%`
      : `共 ${quiz.length} 题，还没有作答`;
    fill($(quizCard, '.cap-bar'), quiz.length ? correct.length / quiz.length : 0);

    const bugRecords = bugs.map((item) => state.bugs[item.id]).filter(Boolean);
    const found = bugRecords.filter((record) => record.found);
    const bugCard = $(root, '[data-sum="bugs"]');
    $(bugCard, '[data-sum-value]').textContent = bugRecords.length ? `${found.length} / ${bugs.length}` : '—';
    $(bugCard, '[data-sum-note]').textContent = bugRecords.length
      ? `独立找到 ${found.filter((record) => !record.hint && !record.revealed).length} 个`
      : `共 ${bugs.length} 个，还没有开始`;
    fill($(bugCard, '.cap-bar'), bugs.length ? found.length / bugs.length : 0, 'ok');

    const project = projectTotals();
    const scores = Object.values(state.rubric).filter((value) => value >= 1 && value <= 4);
    const projectCard = $(root, '[data-sum="project"]');
    $(projectCard, '[data-sum-value]').textContent = project.done || scores.length ? `${project.done} / ${project.total}` : '—';
    const levelText = project.levels.map((level) => `${level.label} ${level.done}/${level.total}`).join(' · ');
    const rubricText = scores.length ? ` · 自评均分 ${(scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1)}` : '';
    $(projectCard, '[data-sum-note]').textContent = levelText + rubricText;
    fill($(projectCard, '.cap-bar'), project.total ? project.done / project.total : 0, 'ok');

    let weakCount = 0;
    let anyData = answered.length > 0 || bugRecords.length > 0 || scores.length > 0;
    const ranked = rows.map((row) => {
      const area = row.dataset.area;
      const own = quiz.filter((item) => item.area === area);
      const ownAnswered = own.filter((item) => state.quiz[item.id]);
      const ownWrong = ownAnswered.filter((item) => !state.quiz[item.id].correct);
      const ownCorrect = ownAnswered.length - ownWrong.length;
      const missed = bugs.filter((item) => item.area === area && state.bugs[item.id]?.revealed && !state.bugs[item.id]?.found);
      const rubric = state.rubric[area];
      const reasons = [];
      if (ownAnswered.length && ownCorrect / ownAnswered.length < 0.7) reasons.push(`自测答对 ${ownCorrect} / ${ownAnswered.length}`);
      if (missed.length) reasons.push(`Bug 猎人有 ${missed.length} 个没找出来`);
      if (rubric && rubric <= 2) reasons.push(`自评 ${rubric} 分`);
      const foundBugs = bugs.filter((item) => item.area === area && state.bugs[item.id]?.found).length;
      const evidence = [];
      if (ownAnswered.length && ownCorrect / ownAnswered.length >= 0.7) evidence.push(`自测答对 ${ownCorrect} / ${ownAnswered.length}`);
      if (foundBugs) evidence.push(`找到 ${foundBugs} 个 bug`);
      if (rubric >= 3) evidence.push(`自评 ${rubric} 分`);
      const tone = reasons.length ? 'weak' : evidence.length ? 'ok' : 'none';
      if (tone === 'weak') weakCount += 1;

      const status = $(row, '[data-weak-status]');
      const why = $(row, '[data-weak-why]');
      status.hidden = tone === 'none';
      status.dataset.tone = tone === 'weak' ? 'warn' : 'ok';
      status.textContent = tone === 'weak' ? '建议回看' : '目前不错';
      why.hidden = tone === 'none';
      why.textContent = tone === 'weak' ? reasons.join('；') : evidence.join('；');
      if (tone === 'none') delete row.dataset.tone;
      else row.dataset.tone = tone;

      const links = $(row, '.cap-weak-links');
      for (const extra of $$(links, '[data-extra]')) extra.remove();
      if (tone === 'weak') {
        const seen = new Set($$(links, 'a').map((anchor) => anchor.getAttribute('href')));
        for (const item of [...ownWrong, ...missed]) {
          const href = item.review.getAttribute('href');
          if (seen.has(href) || seen.size >= 6) continue;
          seen.add(href);
          const li = document.createElement('li');
          li.dataset.extra = '';
          li.append(item.review.cloneNode(true));
          links.append(li);
        }
      }
      return { row, rank: { weak: 0, ok: 1, none: 2 }[tone] };
    });
    ranked.sort((a, b) => a.rank - b.rank).forEach(({ row }) => list.append(row));

    intro.textContent = !anyData
      ? '完成第一关后，这里会按领域标出薄弱项，并列出建议回看的 Lab 和课。'
      : weakCount
        ? `有 ${weakCount} 个领域建议回看，从最上面一项开始。`
        : '目前没有明显的薄弱项。可以继续第三关的进阶和挑战级别。';
    reset.disabled = !anyData && Object.keys(state.checks).length === 0;
  });
}

for (const element of document.querySelectorAll('.cap')) element.dataset.ready = '';
for (const root of document.querySelectorAll('[data-cap-quiz]')) initQuiz(root);
for (const root of document.querySelectorAll('[data-cap-bugs]')) initBugs(root);
if (document.querySelector('[data-cap-level]')) initProject();
for (const root of document.querySelectorAll('[data-cap-rubric]')) initRubric(root);
for (const root of document.querySelectorAll('[data-cap-overview]')) initOverview(root);
for (const root of document.querySelectorAll('[data-cap-summary]')) initSummary(root);
render();
