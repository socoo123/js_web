// 机制图逐步播放：只做增强，服务端已渲染完整的图和分步列表。
// 元素用 data-step 声明在哪些步骤是当前步，用 data-only 声明只在哪些步骤显示；0 表示全图。
// 记号是空格分隔的数字，多轨道的图写成「轨道:数字」，例如 data-step="dfs:3 bfs:6"。
const AUTOPLAY_MS = 2600;

const tokens = (value) => (value ?? '').split(/\s+/).filter(Boolean);

function stepsFor(value, track) {
  const steps = [];
  for (const token of tokens(value)) {
    const colon = token.indexOf(':');
    if (colon < 0) steps.push(Number(token));
    else if (token.slice(0, colon) === track) steps.push(Number(token.slice(colon + 1)));
  }
  return steps;
}

function setup(figure) {
  if (figure.hasAttribute('data-dg-ready')) return;
  figure.setAttribute('data-dg-ready', '');
  const lists = [...figure.querySelectorAll('ol[data-track]')];
  const tracks = lists.map((list) => ({
    id: list.dataset.track,
    label: list.dataset.label ?? '',
    steps: [...list.children].map((item) => item.textContent.replace(/\s+/g, ' ').trim()),
  }));
  const controls = figure.querySelector('[data-dg-controls]');
  const live = figure.querySelector('[data-dg-live]');
  if (!tracks.length || !controls || !live) return;
  const prev = controls.querySelector('[data-dg-prev]');
  const next = controls.querySelector('[data-dg-next]');
  const play = controls.querySelector('[data-dg-play]');
  const count = controls.querySelector('[data-dg-count]');
  const trackButtons = [...controls.querySelectorAll('[data-dg-track]')];
  const marked = [...figure.querySelectorAll('[data-step]')];
  const gated = [...figure.querySelectorAll('[data-only]')];
  let track = tracks[0];
  let step = 0;
  let timer = 0;

  const caption = () => {
    const prefix = tracks.length > 1 ? `${track.label} ` : '';
    if (!step) return `${prefix}全图：共 ${track.steps.length} 步，按「下一步」逐步查看。`;
    return `${prefix}第 ${step} / ${track.steps.length} 步：${track.steps[step - 1]}`;
  };

  const render = () => {
    figure.dataset.track = track.id;
    if (step) figure.dataset.current = String(step);
    else delete figure.dataset.current;
    for (const element of marked) {
      const steps = stepsFor(element.dataset.step, track.id);
      if (!step || !steps.length) element.removeAttribute('data-state');
      else element.dataset.state = steps.includes(step) ? 'current' : step > Math.max(...steps) ? 'past' : 'future';
    }
    for (const element of gated) {
      const list = tokens(element.dataset.only);
      element.hidden = !(list.includes(String(step)) || list.includes(`${track.id}:${step}`));
    }
    prev.disabled = step === 0;
    next.disabled = step === track.steps.length;
    count.textContent = step ? `${step} / ${track.steps.length}` : `全图 · ${track.steps.length} 步`;
    play.textContent = timer ? '暂停' : '重播';
    for (const button of trackButtons) button.setAttribute('aria-pressed', String(button.dataset.dgTrack === track.id));
    live.textContent = caption();
  };

  const stop = () => {
    clearInterval(timer);
    timer = 0;
  };
  // 到首尾时按钮会被禁用，焦点随之丢失；把焦点交给方向相反的按钮，键盘用户不用重新找位置。
  const go = (target) => {
    const focused = document.activeElement;
    step = Math.max(0, Math.min(track.steps.length, target));
    render();
    if (focused instanceof HTMLButtonElement && focused.disabled) (focused === next ? prev : next).focus();
  };

  prev.addEventListener('click', () => { stop(); go(step - 1); });
  next.addEventListener('click', () => { stop(); go(step + 1); });
  play.addEventListener('click', () => {
    if (timer) { stop(); render(); return; }
    timer = setInterval(() => {
      if (step >= track.steps.length) { stop(); render(); return; }
      go(step + 1);
      if (step >= track.steps.length) { stop(); render(); }
    }, AUTOPLAY_MS);
    go(1);
  });
  for (const button of trackButtons) {
    button.addEventListener('click', () => {
      stop();
      track = tracks.find((item) => item.id === button.dataset.dgTrack) ?? tracks[0];
      go(1);
    });
  }
  controls.addEventListener('keydown', (event) => {
    if (!(event.target instanceof HTMLButtonElement)) return;
    if (event.key === 'ArrowLeft' && step > 0) { event.preventDefault(); stop(); go(step - 1); }
    if (event.key === 'ArrowRight' && step < track.steps.length) { event.preventDefault(); stop(); go(step + 1); }
  });

  render();
  for (const block of figure.querySelectorAll('[data-dg-steps]')) block.hidden = true;
  controls.hidden = false;
  live.hidden = false;
}

export function initDiagrams(root = document) {
  for (const figure of root.querySelectorAll('figure[data-diagram][data-stepper]')) setup(figure);
}
