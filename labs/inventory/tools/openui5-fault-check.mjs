// Author-only red/green regression. Faults affect intercepted responses, never learner files.
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { withUI5, inventoryData } from './openui5-support.mjs';
import { checkInventory } from './ui5-check.mjs';
import { checkRouting, checkOData } from './openui5-routing-check.mjs';

const lesson = process.argv[2] ?? 'C42';

await withUI5(async ({ page: initialPage, context, url, errors }) => {
  let page = initialPage;
  async function freshPage() {
    await page.close();
    page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  }
  const controller = '**/controller/Inventory.controller.js';
  async function alter(from, to) {
    await page.route(controller, async (route) => {
      const response = await route.fetch();
      const source = await response.text();
      assert.ok(source.includes(from), `故障替换必须命中实际源码：${from}`);
      await route.fulfill({ response, body: source.replace(from, to) });
    });
  }
  await alter('course/inventory/model/rules', 'course/inventory/model/ruless');
  await page.goto(url);
  await expect.poll(() => errors.some((error) => error.includes('ruless.js'))).toBe(true);
  await expect(page.getByRole('row').filter({ hasText: 'P004' })).toHaveCount(0);
  assert.ok(errors.every((error) => error.includes('ruless')), '模块故障阶段仅允许目标加载错误');
  console.log('RED C40：真实依赖 ruless.js 404，Controller 未创建，六商品断言失败。');
  await page.unroute(controller);
  await freshPage();
  errors.length = 0;
  await checkInventory(page, url, { lesson: lesson === 'C40' ? 'C40' : 'C41', language: false });
  console.log(`GREEN C40：恢复 rules，${lesson === 'C40' ? '六件/0库存/统计6/52' : '列表与共享编辑向量'}通过。`);
  if (lesson === 'C40') return;

  await alter('this._editPath = context.getPath();', 'this._editPath = "/products/0";');
  await assert.rejects(() => checkInventory(page, url, { lesson: 'C41', language: false }));
  const corrupted = await inventoryData(page);
  assert.equal(corrupted[0].stock, 8); assert.equal(corrupted[3].stock, 3);
  await expect.poll(() => errors.includes('重复编号 P004')).toBe(true);
  assert.ok(errors.every((error) => error === '重复编号 P004'), '错误写入导致共享校验拒绝重复id');
  console.log('RED C41：context仍/products/3/P004；原P001位置被P004草稿覆盖stock8，原P004仍3，重复id使汇总拒绝；共同向量真实失败。');
  await page.unroute(controller);
  await freshPage();
  errors.length = 0;
  await checkInventory(page, url, { lesson: 'C41', language: false });
  console.log('GREEN C41：恢复context路径，P004=8/P001=12/57及取消/非法/0通过。');

  await alter('event.getSource().getBindingContext("inventory").getProperty("id")', 'this.byId("products").indexOfItem(event.getSource())');
  await page.goto(url);
  await page.getByRole('searchbox').fill('P004'); await page.getByRole('searchbox').press('Enter');
  await expect(page.getByRole('button', { name: /编辑$/ })).toHaveCount(1);
  await page.getByRole('row').filter({ hasText: 'P004' }).getByText('USB-C 扩展坞', { exact: true }).click();
  await expect(page).toHaveURL(/#\/products\/0$/);
  await expect(page.getByText('未找到商品。', { exact: true })).toBeVisible();
  console.log('RED C42：可见索引传路由得到products/0，P004详情断言失败。');
  await page.unroute(controller);
  await freshPage();
  await checkRouting(page, url);
  console.log('GREEN C42：恢复id，详情刷新/历史/未知id通过。');

  await page.route('**/probe/odata.js', async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    assert.ok(source.includes('model.read("/Products",'));
    await route.fulfill({ response, body: source.replace('model.read("/Products",', 'model.read("/products",') });
  });
  await page.goto(new URL('probe/odata.html', url).href);
  await expect(page.getByRole('status')).toHaveText('读取失败 404');
  await expect.poll(() => errors.some((error) => /404 .*\/localService\/service\/products\?/.test(error))).toBe(true);
  assert.ok(errors.every((error) => /404 .*\/localService\/service\/products\?/.test(error)), '集合故障阶段仅允许目标404');
  console.log('RED C42 V2：实体集写成products，mock返回404；静态metadata仍200。');
  await page.unroute('**/probe/odata.js');
  await freshPage();
  errors.length = 0;
  await checkOData(page, url);
  console.log('GREEN C42 V2：恢复Products，范围/排序/分页/单键0通过。');
});
