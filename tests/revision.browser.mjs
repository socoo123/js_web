import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { globSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';
import { comparison } from '../labs/sources.mjs';
import catalog from '../labs/catalog.json' with { type: 'json' };
import { importedContent } from '../scripts/lesson-sources.mjs';

const base = process.env.REVISION_BASE_URL ?? 'http://127.0.0.1:8874/js_web/';
const qa = path.resolve(process.env.REVISION_QA_DIR ?? '.cache/qa/v2/site-review');
const dist = path.resolve(process.env.REVISION_DIST_DIR ?? 'dist');
await mkdir(qa, { recursive: true });
const requestedRoutes = process.env.REVISION_ROUTES?.split(',').filter(Boolean);
const routes = globSync('**/*.html', { cwd: dist }).filter((route) => !route.startsWith('demos/')).map((route) => route.replace(/index\.html$/, '')).filter((route) => !requestedRoutes || requestedRoutes.includes(route)).sort();
if (requestedRoutes) assert.deepEqual([...routes].sort(), [...requestedRoutes].sort(), '请求验收的页面必须全部存在');
else assert.equal(routes.length, 61, '全站验收必须包含 61 个静态页面');
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
  '', 'roadmap/', 'labs/', 'labs/l5/',
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
      for (const image of await page.locator('.sl-markdown-content img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((img) => Boolean(img.alt) && img.complete && img.naturalWidth > 0), { message: `正文图片 ${route}` }).toBe(true);
        const src = await image.getAttribute('src');
        assert(src.startsWith('/js_web/'), `图片必须保留 Pages 子路径 ${route}`);
        const name = /\/(c\d{2}-[^.]+)\./.exec(src)?.[1];
        assert(name, `D2 资源命名 ${src}`);
        diagrams.set(name, { route, src, alt: await image.getAttribute('alt') });
        // 长图的元素截图会跨过固定页头；仅在特写截图中隐藏页头，整页截图保留原样。
        if (width === 1280) await screenshot(image, `${name}-${theme}.png`, { style: '.header, .mobile-preferences { visibility: hidden !important; }' });
      }
      if (trials.includes(route)) {
        await expect(page.locator('[data-lesson-task]')).toBeVisible();
        await expect(page.locator('.compare-side')).toHaveCount(cardCounts.get(route) * 2);
        for (const [index, target] of (await page.locator('.code-compare').all()).entries()) {
          const sides = target.locator('.compare-side');
          const left = await sides.nth(0).boundingBox(); const right = await sides.nth(1).boundingBox();
          assert(left && right, `对照两侧可见 ${route}`);
          assert(width === 1280 ? Math.abs(left.y - right.y) < 2 : right.y > left.y + left.height - 2, `双栏响应式 ${route} ${width}`);
          if (sampleRoutes.has(route)) {
            await target.scrollIntoViewIfNeeded();
            await screenshot(target, `${slug}-compare-${index}-${width}-${theme}.png`, { style: '.header, .mobile-preferences { visibility: hidden !important; }' });
          }
        }
      }
    }
  }
  if (!process.env.REVISION_INTERACTIONS_ONLY && !requestedRoutes) assert.equal(diagrams.size, 14, '全站必须显示全部 14 张 D2');
  evidence.diagrams = Object.fromEntries(diagrams);
  await page.setViewportSize({ width: 1280, height: 950 });
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
  for (const image of await images.all()) assert(await image.evaluate((img) => Boolean(img.alt) && img.complete && img.naturalWidth > 0), 'D2 加载/alt');
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
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 950 } });
  const plain = await nojs.newPage();
  for (const route of routes) {
    assert.equal((await plain.goto(base + route)).status(), 200, `无 JS ${route}`);
    await expect(plain.locator('h1').first()).toBeVisible();
    assert(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `无 JS 整页溢出 ${route}`);
    for (const button of await plain.locator('.expressive-code .copy button, [data-progress-controls]').all()) await expect(button).toBeHidden();
    if (trials.includes(route)) {
      await expect(plain.locator('[data-lesson-task]')).toBeVisible();
      await expect(plain.locator('.compare-side')).toHaveCount(cardCounts.get(route) * 2);
      for (const button of await plain.locator('.code-compare button').all()) await expect(button).toBeHidden();
    }
    const answer = plain.locator('summary').filter({ hasText: /^参考答案$/ }).first();
    if (await answer.count()) { await answer.focus(); await plain.keyboard.press('Enter'); await expect(answer.locator('..')).toHaveAttribute('open', ''); }
    evidence.noJavaScript.push(route);
    if (sampleRoutes.has(route)) await screenshot(plain, `${route ? route.replace(/\/$/, '').replaceAll('/', '--') : 'home'}-nojs-360.png`);
  }
  await nojs.close();
  assert.deepEqual(errors, []);
  evidence.status = 'passed';
  console.log(`V2 浏览器自动验收（${evidence.phase}，Chromium ${evidence.browser}）：${evidence.geometry.length ? `${routes.length} 页 × 三宽度/亮暗 = ${evidence.geometry.length} 组；${diagrams.size} 张 D2` : '交互专项复测（未重做全图统计）'}、键盘/复制/答案、七词搜索、${evidence.noJavaScript.length} 页禁用 JS 阅读。截图/JSON：${qa}。自动断言不代表人工逐图审阅或最终集成通过。`);
} catch (error) {
  evidence.status = 'failed'; evidence.failure = error.stack;
  throw error;
} finally {
  await writeFile(path.join(qa, 'results.json'), JSON.stringify(evidence, null, 2) + '\n');
  await browser.close();
}
