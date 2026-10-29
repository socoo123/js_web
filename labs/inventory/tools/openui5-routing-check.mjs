import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { withUI5 } from './openui5-support.mjs';

export async function checkRouting(page, url) {
  const base = new URL(url); base.search = ''; base.hash = '';
  await page.goto(base.href);
  const search = page.getByRole('searchbox');
  await search.fill('P004'); await search.press('Enter');
  const row = page.getByRole('row').filter({ hasText: 'P004' });
  await expect(page.getByRole('button', { name: /编辑$/ })).toHaveCount(1);
  await row.getByText('USB-C 扩展坞', { exact: true }).click();
  await page.waitForURL(/#\/products\/P004$/);
  await expect(page.locator('[id$="--detailStock"]')).toContainText('3');
  await page.reload();
  await expect(page.locator('[id$="--detailStock"]')).toContainText('3');
  await page.getByRole('button', { name: '返回列表', exact: true }).press('Enter');
  await expect(page.getByRole('button', { name: /编辑$/ })).toHaveCount(6);
  await page.getByRole('row').filter({ hasText: 'P002' }).getByText('无线鼠标', { exact: true }).click();
  await expect(page.locator('[id$="--detailStock"]')).toContainText('0');
  await page.goBack();
  await expect(page.getByRole('button', { name: /编辑$/ })).toHaveCount(6);
  await page.goForward();
  await expect(page.locator('[id$="--detailStock"]')).toContainText('0');
  await page.goto(`${base.href}#/products/P999`);
  await expect(page.getByText('未找到商品。', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('未找到商品。', { exact: true })).toBeVisible();
  await page.goto(`${base.href}#/wrong/path`);
  await expect(page.getByText('页面地址不存在', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回列表', exact: true }).press('Enter');
  await expect(page.getByRole('button', { name: /编辑$/ })).toHaveCount(6);
  const metadata = await page.request.get(new URL('localService/metadata.xml', base).href);
  assert.equal(metadata.status(), 200);
  assert.match(await metadata.text(), /EntitySet Name="Products"/);
  console.log('C42：筛选 P004 → 稳定 id hash；直接刷新、返回、浏览器后退/前进、P002=0、未知 id/地址通过。');
}

export async function checkOData(page, url) {
  const probe = new URL('probe/odata.html', url);
  await page.goto(probe.href);
  await expect(page.getByRole('status')).toHaveText('P006 降噪耳机 5；P004 USB-C 扩展坞 3；本页库存 8', { timeout: 45000 });
  await page.getByRole('button', { name: '跳过第一件', exact: true }).press('Enter');
  await expect(page.getByRole('status')).toHaveText('P004 USB-C 扩展坞 3；本页库存 3');
  assert.equal(await page.evaluate(() => window.odataProbe.model.getProperty("/Products('P999')/stock")), undefined, 'getProperty 只读缓存');
  const single = await page.evaluate(() => new Promise((resolve, reject) => window.odataProbe.model.read("/Products('P002')", {
    success: (data) => resolve({ id: data.id, stock: data.stock }), error: reject,
  })));
  assert.deepEqual(single, { id: 'P002', stock: 0 });
  const missing = await page.evaluate(() => new Promise((resolve) => window.odataProbe.model.read("/Products('P999')", {
    success: () => resolve('unexpected'), error: (error) => resolve(error.statusCode),
  })));
  assert.equal(Number(missing), 404);
  const records = await page.evaluate(() => window.odataProbe.requests);
  const queries = records.filter((url) => url.includes('Products?')).map((url) => new URL(url, probe.href).searchParams);
  assert.ok(queries.some((query) => query.get('$filter') === 'stock ge 1 and stock le 5'
    && query.get('$orderby') === 'stock desc,id asc' && query.get('$skip') === '1'
    && query.get('$top') === '1' && query.get('$select') === 'id,name,stock,priceCents'));
  const data = await page.request.get(new URL('localService/mockdata/Products.json', url).href);
  assert.equal(data.status(), 200); assert.equal((await data.json()).length, 6);
  console.log(`C42：V2 metadata/标量数据；过滤排序 [P006,P004]，skip=1/top=1 得 P004；单件0/未知404；${records.length} 条模拟请求可观察，分页小计不作全量。`);
}

if (process.argv[1]?.endsWith('/openui5-routing-check.mjs')) {
  await withUI5(async ({ page, url }) => { await checkRouting(page, url); await checkOData(page, url); });
}
