import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { globSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';
import { comparison } from '../labs/sources.mjs';
import catalog from '../labs/catalog.json' with { type: 'json' };
import { importedContent } from '../scripts/lesson-sources.mjs';
import { DIAGRAMS } from '../src/components/diagrams/registry.mjs';
import { emptyProgress, markLabStep, markLesson, writeProgress } from '../src/lib/progress.mjs';

const base = process.env.REVISION_BASE_URL ?? 'http://127.0.0.1:8874/js_web/';
const qa = path.resolve(process.env.REVISION_QA_DIR ?? '.cache/qa/v2/site-review');
const dist = path.resolve(process.env.REVISION_DIST_DIR ?? 'dist');
await mkdir(qa, { recursive: true });
const requestedRoutes = process.env.REVISION_ROUTES?.split(',').filter(Boolean);
const routes = globSync('**/*.html', { cwd: dist }).filter((route) => !route.startsWith('demos/')).map((route) => route.replace(/index\.html$/, '')).filter((route) => !requestedRoutes || requestedRoutes.includes(route)).sort();
if (requestedRoutes) assert.deepEqual([...routes].sort(), [...requestedRoutes].sort(), '请求验收的页面必须全部存在');
else assert.equal(routes.length, 64, '全站验收必须包含 64 个静态页面（含 Lab 规则页、L5 后端接口与 L6）');
// 固定第一版公开地址；不能随 catalog 改名而静默跳过旧 URL。
const legacyGroups = {
  '01-history-web': ['c01-story-ecosystem', 'c02-web-debugging'],
  '02-language-data': ['c03-values-types', 'c04-scope-control', 'c05-objects-json', 'c06-functions-closures', 'c07-this-prototypes', 'c08-arrays-processing', 'c09-maps-sets', 'c10-stacks-queues-trees'],
  '03-async-modules': ['c11-dom-events-forms', 'c12-callbacks-promises', 'c13-async-await-fetch', 'c14-storage-errors', 'c15-css-layout-responsive', 'c16-modules-dependencies'],
  '04-runtime-tooling': ['c17-node-browser', 'c18-npm-reproducible-installs', 'c19-yarn-pnpm-bun', 'c20-vite-vitest'],
  '05-react': ['c21-react-jsx-components', 'c22-props-composition-render', 'c23-state-snapshot-queue', 'c24-arrays-keys-derived', 'c25-forms-validation-accessibility', 'c26-state-ownership-reset', 'c27-reducer-context', 'c28-refs-external-systems', 'c29-effects-cleanup', 'c30-requests-races', 'c31-custom-hooks-routing', 'c32-tanstack-query-server-state', 'c33-modern-react-actions', 'c34-performance-loading-errors', 'c35-react-testing', 'c36-react-project-debugging'],
  '06-components-ui5': ['c37-component-ecosystem-selection', 'c38-antd-inventory', 'c39-fiori-ui5-family', 'c40-openui5-mvc-project', 'c41-model-binding-controls', 'c42-routing-odata', 'c43-native-web-components', 'c44-ui5-react'],
  '07-project': ['c45-debug-delivery-checks', 'c46-static-build-pages', 'c47-project-testing-strategy', 'c48-review-next-steps'],
};
const legacyRoutes = Object.entries(legacyGroups).flatMap(([dir, slugs]) => slugs.map((slug) => `${dir}/${slug}/`));
const references = ['es-versions', 'java-js', 'react-hooks', 'ui5-family'].map((slug) => `reference/${slug}/`);
assert.equal(legacyRoutes.length, 48);
if (!requestedRoutes) for (const route of [...legacyRoutes, ...references]) assert(routes.includes(route), `保留公开地址 ${route}`);
const trials = catalog.lessons.filter((row) => row.migrated).map((row) => row.slug + '/');
const cardCounts = new Map(catalog.lessons.filter((row) => row.migrated).map((row) => {
  const [file] = globSync(`src/content/docs/${row.slug}.{md,mdx}`);
  const cards = importedContent(readFileSync(file, 'utf8')).components.filter((item) => item.component === 'CodeCompare');
  return [row.slug + '/', cards.length];
}));
const copyRoute = '02-language-data/c03-values-types/';
const sampleRoutes = new Set([
  ...(requestedRoutes ?? []),
  '', 'roadmap/', 'labs/', 'labs/l5/', 'labs/api/', 'labs/l6/',
  '03-async-modules/c15-css-layout-responsive/',
  '05-react/c21-react-jsx-components/',
  '05-react/c26-state-ownership-reset/',
  '05-react/c30-requests-races/',
  '05-react/c32-tanstack-query-server-state/',
  '05-react/c35-react-testing/',
  '05-react/c36-react-project-debugging/',
  'labs/l3/',
  ...legacyGroups['07-project'].map((slug) => `07-project/${slug}/`),
  ...references,
]);
const errors = [];
const diagrams = new Map();
const evidence = {
  phase: process.env.REVISION_PHASE ?? 'local (not integrated acceptance)',
  base, dist, release: catalog.release, routes,
  artifactSha256: createHash('sha256').update(routes.map((route) => `${route}\n${readFileSync(path.join(dist, route.endsWith('.html') ? route : `${route}index.html`), 'utf8')}`).join('\n')).digest('hex'),
  geometry: [], noJavaScript: [], checks: [], screenshots: [], errors,
  status: 'running',
};
const screenshot = async (target, name, options = {}) => {
  await target.screenshot({ path: path.join(qa, name), ...options });
  evidence.screenshots.push(name);
};
// 用站点自己的写入函数生成存储原文，进度格式升级时测试不需要跟着改。
const progressSeed = (ids) => {
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, String(value)), removeItem: (key) => memory.delete(key) };
  writeProgress(storage, ids.reduce((progress, id) => markLesson(progress, id, true), markLabStep(emptyProgress(), 'l3-c21-1', true)));
  return [...memory];
};
const reactChunks = new Map();
const loadsReact = async (request, url) => {
  if (!reactChunks.has(url)) reactChunks.set(url, /react\.(?:transitional\.)?element|__CLIENT_INTERNALS_DO_NOT_USE|react-dom/.test(await (await request.get(url)).text()));
  return reactChunks.get(url);
};
const focusVisible = async (target) => {
  await target.page().keyboard.press('Tab');
  await target.focus();
  await expect(target).toBeFocused();
  assert(await target.evaluate((element) => {
    const style = getComputedStyle(element);
    return element.matches(':focus-visible') && style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0 && style.outlineColor !== 'transparent' && style.outlineColor !== 'rgba(0, 0, 0, 0)';
  }), '键盘焦点必须有可见轮廓');
};
const browser = await chromium.launch();
evidence.browser = browser.version();
try {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  context.on('page', (tab) => {
    tab.on('pageerror', (error) => errors.push(error.message));
    tab.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  assert.equal((await context.request.get(new URL('__missing-browser-audit__.js', base).href)).status(), 404, '静态服务器不得使用 HTML fallback 掩盖缺失资源');
  evidence.checks.push('strict missing-resource 404');
  if (!process.env.REVISION_INTERACTIONS_ONLY) for (const width of [360, 768, 1280]) for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto(base); await page.locator('starlight-theme-select select').first().selectOption(theme, { force: true });
    for (const route of routes) {
      const response = await page.goto(base + route); assert.equal(response.status(), 200, route);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `整页溢出 ${route} ${width} ${theme}`);
      evidence.geometry.push({ route, width, theme, status: response.status() });
      const slug = route ? route.replace(/\/$/, '').replaceAll('/', '--') : 'home';
      await screenshot(page, `${slug}-page-${width}-${theme}.png`);
      if (width === 1280 && theme === 'light' && !(await page.locator('astro-island').count())) {
        const scripts = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name).filter((name) => /\.m?js(?:$|\?)/.test(name)));
        for (const url of scripts) assert(!(await loadsReact(context.request, url)), `没有 island 的页面不得加载 React ${route} ${url}`);
      }
      // 亮/暗成对的截图只有一张可见；正文截图只核对加载、alt 与子路径。
      for (const image of await page.locator('.sl-markdown-content img').all()) {
        if (!(await image.isVisible())) continue;
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((img) => Boolean(img.alt) && img.complete && img.naturalWidth > 0), { message: `正文图片 ${route}` }).toBe(true);
        const src = await image.getAttribute('src');
        assert(src.startsWith('/js_web/'), `图片必须保留 Pages 子路径 ${route}`);
      }
      // 机制图是 HTML：与正文栏同宽、内部不滚动，标题和描述可被读屏读到。
      for (const figure of await page.locator('figure[data-diagram]').all()) {
        const name = await figure.getAttribute('data-diagram');
        assert(DIAGRAMS[name], `未登记的机制图 ${name}`);
        await expect(figure.locator('.dg-title')).toHaveText(DIAGRAMS[name].title);
        const [box, column] = [await figure.boundingBox(), await page.locator('.sl-markdown-content').first().boundingBox()];
        assert(box && column && box.x >= column.x - 1 && box.x + box.width <= column.x + column.width + 1, `机制图超出正文栏 ${route} ${width}`);
        assert(await figure.evaluate((element) => [element, ...element.querySelectorAll('*')].every((node) => node.matches('.js-visually-hidden') || node.scrollWidth <= node.clientWidth + 1 || getComputedStyle(node).overflowX === 'visible')), `机制图内部横向溢出 ${name} ${width}`);
        diagrams.set(name, { route, steps: await figure.locator('[data-dg-steps] li').count() });
        // 长图的元素截图会跨过固定页头；仅在特写截图中隐藏页头，整页截图保留原样。
        if (width === 1280 || width === 360) {
          await figure.scrollIntoViewIfNeeded();
          await screenshot(figure, `${name}-${width}-${theme}.png`, { style: 'header.header, .mobile-preferences, mobile-starlight-toc { visibility: hidden !important; }' });
        }
      }
      if (trials.includes(route)) {
        await expect(page.locator('[data-lesson-task]')).toBeVisible();
        await expect(page.locator('.compare-side')).toHaveCount(cardCounts.get(route) * 2);
        for (const [index, target] of (await page.locator('.code-compare').all()).entries()) {
          const sides = target.locator('.compare-side');
          const left = await sides.nth(0).boundingBox(); const right = await sides.nth(1).boundingBox();
          assert(left && right, `对照两侧可见 ${route}`);
          // V4：Java 在上、JS 在下，两段与正文栏同宽、左右对齐。
          assert(right.y > left.y + left.height - 2 && Math.abs(left.x - right.x) < 2 && Math.abs(left.width - right.width) < 2, `对照纵向对齐 ${route} ${width}`);
          if (sampleRoutes.has(route)) {
            await target.scrollIntoViewIfNeeded();
            await screenshot(target, `${slug}-compare-${index}-${width}-${theme}.png`, { style: 'header.header, .mobile-preferences { visibility: hidden !important; }' });
          }
        }
      }
    }
  }
  if (!process.env.REVISION_INTERACTIONS_ONLY && !requestedRoutes) assert.deepEqual([...diagrams.keys()].sort(), Object.keys(DIAGRAMS).sort(), '全站必须显示全部登记的机制图');
  evidence.diagrams = Object.fromEntries(diagrams);
  await page.setViewportSize({ width: 1280, height: 950 });
  // 分步图：键盘按「下一步」后，当前步高亮、说明随之更新；「上一步」回到全图。
  await page.goto(base + '03-async-modules/c12-callbacks-promises/');
  const stepper = page.locator('figure[data-diagram="c12-browser-event-loop"]');
  const next = stepper.getByRole('button', { name: /下一步/ });
  await focusVisible(next); await page.keyboard.press('Enter');
  await expect(stepper.locator('[data-dg-live]')).toContainText('第 1 / 7 步');
  await expect(stepper.locator('[data-state="current"]').first()).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(stepper.locator('[data-dg-live]')).toContainText('全图');
  await expect(stepper.locator('[data-state]')).toHaveCount(0);
  evidence.checks.push('diagram stepper keyboard next/previous and live caption');
  await page.goto(base + copyRoute);
  await page.keyboard.press('Tab');
  for (let side = 0; side < 2; side++) {
    const column = page.locator('.compare-side').nth(side); const expected = comparison('c03-input-number')[side === 0 ? 'left' : 'right'].code;
    const button = column.getByRole('button', { name: '复制到剪贴板' }); await focusVisible(button); await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
    await expect(column.locator('[data-copy-feedback]')).toContainText('代码已复制');
  }
  evidence.checks.push('independent Java/JS keyboard copy and live success feedback');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } }));
  await page.locator('.compare-side').first().getByRole('button', { name: '复制到剪贴板' }).click();
  await expect(page.locator('[data-copy-feedback]').first()).toContainText('复制失败，请选中本侧代码手动复制');
  await page.setViewportSize({ width: 360, height: 950 });
  await expect.poll(() => page.locator('.compare-side pre').first().evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await focusVisible(page.locator('.compare-side pre').first());
  const answer = page.locator('summary').filter({ hasText: /^参考答案$/ }).first(); await focusVisible(answer); await page.keyboard.press('Enter');
  await expect(answer.locator('..')).toHaveAttribute('open', '');
  await screenshot(page, 'keyboard-copy-answer.png');
  evidence.checks.push('copy rejection feedback, keyboard code focus and native answer');
  const images = page.locator('article img');
  for (const image of await images.all()) if (await image.isVisible()) assert(await image.evaluate((img) => Boolean(img.alt) && img.complete && img.naturalWidth > 0), '正文图片加载/alt');
  for (const query of ['闭包', '状态快照', '断点', '单元测试', 'UI5', 'useEffect', 'npm ci']) {
    const search = page.getByRole('button', { name: '搜索' }).first();
    await focusVisible(search); await page.keyboard.press('Enter');
    const input = page.getByRole('dialog').getByRole('textbox', { name: '搜索课程' }); await input.fill(query);
    await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
    const result = page.locator('.pagefind-ui__result-link').first();
    const href = await result.getAttribute('href');
    assert(new URL(href, base).pathname.startsWith('/js_web/'), `搜索子路径 ${query}`);
    assert.equal((await context.request.get(new URL(href, base).href)).status(), 200, `搜索结果 ${query}`);
    await screenshot(page, `search-${encodeURIComponent(query)}.png`);
    await page.keyboard.press('Escape');
    await expect(search).toBeFocused();
    evidence.checks.push(`search: ${query}`);
  }
  await page.goto(base + '03-async-modules/c15-css-layout-responsive/');
  await expect(page.locator('[data-comparison="c15-layout-budget"]')).toHaveCount(0);
  const css = page.locator('.expressive-code').filter({ hasText: '* { box-sizing: border-box; }' }).first();
  const cssButton = css.getByRole('button', { name: '复制到剪贴板' });
  await focusVisible(cssButton); await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))');
  evidence.checks.push('C15 standalone CSS keyboard copy, no forced Java layout card');
  await page.goto(base + 'roadmap/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: '跳转到内容' });
  await focusVisible(skip); await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).hash, '#_top');
  evidence.checks.push('keyboard skip link');
  if (!requestedRoutes) {
    const marks = await browser.newContext({ viewport: { width: 1280, height: 950 } });
    const seed = (target, ids) => target.evaluate((entries) => {
      for (const [key, value] of entries) localStorage.setItem(key, value);
      window.dispatchEvent(new Event('js_web:progress'));
    }, progressSeed(ids));
    const home = await marks.newPage();
    home.on('pageerror', (error) => errors.push(error.message));
    await home.goto(base);
    await expect(home.locator('[data-home-labs] [role="tab"]')).toHaveCount(6);
    await expect(home.locator('[data-continue]')).toBeVisible();
    await expect(home.locator('[data-continue-lesson]')).toHaveAttribute('href', /\/c01-story-ecosystem\/$/);
    await seed(home, ['C01', 'C02', 'C03']);
    await expect(home.locator('[data-continue-lesson]')).toHaveAttribute('href', /\/c04-scope-control\/$/);
    await expect(home.locator('[data-tab="l1"] [data-tab-count]')).toHaveText('3/10');
    await expect(home.locator('[data-tab="l1"]')).toHaveAttribute('aria-selected', 'true');
    await expect(home.locator('[data-next-lesson="l1"]')).toHaveText('继续 C04');
    await screenshot(home, 'home-progress-1280.png');
    const cards = await marks.newPage();
    cards.on('pageerror', (error) => errors.push(error.message));
    await cards.goto(base + 'labs/');
    await expect(cards.locator('[data-lab-card]')).toHaveCount(5);
    await expect(cards.locator('[data-missing-preview]')).toHaveCount(0);
    await expect(cards.locator('[data-lab-card="L1"]')).toHaveAttribute('data-lab-state', 'active');
    await expect(cards.locator('[data-lab-card="L2"]')).toHaveAttribute('data-lab-state', 'new');
    await expect(cards.locator('[data-lab-card="L1"] [data-lab-ring-text]')).toHaveText('3/10');
    const lesson = await marks.newPage();
    lesson.on('pageerror', (error) => errors.push(error.message));
    await lesson.goto(base + '02-language-data/c08-arrays-processing/');
    await expect(lesson.locator('a[data-sidebar-lesson="C03"][data-done]')).toHaveCount(1);
    await expect(lesson.locator('a[data-sidebar-lesson="C04"][data-done]')).toHaveCount(0);
    await expect(lesson.locator('a[data-sidebar-lab="L1"][data-active-lab] .sidebar-lab-progress')).toHaveText('3/10');
    await seed(home, ['C01', 'C02', 'C03', 'C04']);
    await expect(lesson.locator('a[data-sidebar-lesson="C04"][data-done]')).toHaveCount(1);
    await expect(lesson.locator('a[data-sidebar-lab="L1"] .sidebar-lab-progress')).toHaveText('4/10');
    await lesson.goto(base + 'roadmap/');
    await expect(lesson.locator('[data-done-count]').first()).toHaveText('已完成 4 / 10 课');
    await expect(lesson.locator('.lesson-completed')).toHaveCount(4);
    const stored = JSON.parse(await lesson.evaluate(() => localStorage.getItem('js_web:progress:v1')));
    assert.equal(stored.version, 2);
    assert.deepEqual(stored.labSteps, ['l3-c21-1']);
    await marks.close();
    evidence.checks.push('progress marks: home continue/Lab rings, sidebar same-tab event and cross-tab storage, roadmap week count');
  }
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 950 } });
  const plain = await nojs.newPage();
  for (const route of routes) {
    assert.equal((await plain.goto(base + route)).status(), 200, `无 JS ${route}`);
    await expect(plain.locator('h1').first()).toBeVisible();
    assert(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `无 JS 整页溢出 ${route}`);
    for (const button of await plain.locator('.expressive-code .copy button, [data-progress-controls]').all()) await expect(button).toBeHidden();
    for (const mark of await plain.locator('[data-continue], [data-lab-ring], [data-card-next], [data-lab-js], [data-done-count]').all()) await expect(mark).toBeHidden();
    for (const back of await plain.locator('nav[data-lab-next]').all()) {
      await expect(back).toBeVisible();
      await expect(back.locator('a[href^="/js_web/labs/l"]').first()).toBeVisible();
    }
    if (route === '') {
      await expect(plain.locator('[data-home-labs] [data-panel]')).toHaveCount(6);
      for (const panel of await plain.locator('[data-home-labs] [data-panel]').all()) await expect(panel).toBeVisible();
      await expect(plain.locator('[data-home-labs] [data-panel] a.js-button[href^="/js_web/labs/l"]')).toHaveCount(6);
    }
    if (route === 'labs/') await expect(plain.locator('[data-lab-card] a[href^="/js_web/labs/l"]')).toHaveCount(5);
    if (trials.includes(route)) {
      await expect(plain.locator('[data-lesson-task]')).toBeVisible();
      await expect(plain.locator('.compare-side')).toHaveCount(cardCounts.get(route) * 2);
      for (const button of await plain.locator('.code-compare button').all()) await expect(button).toBeHidden();
    }
    // 无 JS：分步图的控件隐藏，步骤以有序列表完整显示。
    for (const figure of await plain.locator('figure[data-diagram][data-stepper]').all()) {
      if (!(await figure.locator('[data-dg-steps]').count())) continue;
      await expect(figure.locator('[data-dg-controls]')).toBeHidden();
      await expect(figure.locator('[data-dg-steps] li').first()).toBeVisible();
    }
    const answer = plain.locator('summary').filter({ hasText: /^参考答案$/ }).first();
    if (await answer.count()) { await answer.focus(); await plain.keyboard.press('Enter'); await expect(answer.locator('..')).toHaveAttribute('open', ''); }
    evidence.noJavaScript.push(route);
    if (sampleRoutes.has(route)) await screenshot(plain, `${route ? route.replace(/\/$/, '').replaceAll('/', '--') : 'home'}-nojs-360.png`);
  }
  await nojs.close();
  assert.deepEqual(errors, []);
  evidence.status = 'passed';
  console.log(`V2 浏览器自动验收（${evidence.phase}，Chromium ${evidence.browser}）：${evidence.geometry.length ? `${routes.length} 页 × 三宽度/亮暗 = ${evidence.geometry.length} 组；${diagrams.size} 张机制图` : '交互专项复测（未重做全图统计）'}、键盘/复制/答案、七词搜索、${evidence.noJavaScript.length} 页禁用 JS 阅读。截图/JSON：${qa}。自动断言不代表人工逐图审阅或最终集成通过。`);
} catch (error) {
  evidence.status = 'failed'; evidence.failure = error.stack;
  throw error;
} finally {
  await writeFile(path.join(qa, 'results.json'), JSON.stringify(evidence, null, 2) + '\n');
  await browser.close();
}
