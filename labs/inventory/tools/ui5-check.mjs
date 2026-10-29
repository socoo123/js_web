import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { expect } from '@playwright/test';
import { withUI5, inventoryData, products } from './openui5-support.mjs';

export async function checkInventory(page, url, { prototype = false, lesson = 'C41', language = true } = {}) {
  await page.goto(url);
  await expect(page.getByRole('row').filter({ hasText: 'P002' })).toContainText('0', { timeout: 45000 });
  assert.deepEqual(await inventoryData(page), products);
  if (lesson === 'C40') {
    await expect(page.getByRole('row').filter({ hasText: /P00\d/ })).toHaveCount(6);
    await page.getByRole('button', { name: '计算全量库存', exact: true }).press('Enter');
    await expect(page.locator('[id$="--message"]')).toHaveText('6 种商品，总库存 52 件');
    console.log('C40：六商品逐字段等于固定数据；P002=0；共享统计按钮输出6/52。');
    return;
  }
  const edits = page.getByRole('button', { name: /编辑$/ });
  const stock = page.getByRole('textbox', { name: '库存', exact: true });
  const search = page.getByRole('searchbox');
  await expect(edits).toHaveCount(6);
  if (!prototype) await expect(page.locator('[id$="--allStock"]')).toHaveText('52');
  await search.fill('P004'); await search.press('Enter');
  await expect(edits).toHaveCount(1);
  const identity = await page.evaluate(() => {
    const item = sap.ui.require('sap/ui/core/Element').getElementById(
      [...document.querySelectorAll('[id$="--products"]')][0].id).getItems()[0];
    const context = item.getBindingContext('inventory');
    return { path: context.getPath(), id: context.getProperty('id') };
  });
  assert.deepEqual(identity, { path: '/products/3', id: 'P004' });
  await edits.focus(); await edits.press('Enter');
  await stock.focus(); await stock.press('ControlOrMeta+A'); await stock.press('8');
  const cancel = page.getByRole('button', { name: '取消', exact: true });
  await cancel.focus(); await cancel.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  assert.deepEqual(await inventoryData(page), products, '取消不改变任何正式字段');
  if (!prototype) await expect(page.locator('[id$="--allStock"]')).toHaveText('52');
  await edits.press('Enter');
  await expect(stock).toHaveValue('3');
  for (const invalid of ['', '-1']) {
    await stock.fill(invalid);
    const save = page.getByRole('button', { name: '保存', exact: true });
    await save.focus(); await save.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(stock).toBeFocused();
    assert.deepEqual(await inventoryData(page), products, `拒绝 ${JSON.stringify(invalid)}`);
  }
  await stock.fill('8');
  await page.getByRole('button', { name: '保存', exact: true }).press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const saved = await inventoryData(page);
  assert.deepEqual(saved, products.map((product) => product.id === 'P004' ? { ...product, stock: 8 } : product),
    'P004 保存8/P001 不变，所有其他字段保留');
  await expect(page.locator('[id$="--totalStock"]')).toHaveText('8');
  await expect(page.locator('[id$="--totalValue"]')).toHaveText('2392.00');
  if (!prototype) await expect(page.locator('[id$="--allStock"]')).toHaveText('57');
  await search.fill(''); await search.press('Enter');
  await expect(edits).toHaveCount(6);
  await expect(page.locator('[id$="--totalStock"]')).toHaveText('57');
  await search.fill('不存在'); await search.press('Enter');
  await expect(edits).toHaveCount(0);
  await expect(page.locator('[id$="--totalStock"]')).toHaveText('0');
  await page.reload();
  await expect(edits).toHaveCount(6);
  await search.fill('P004'); await search.press('Enter');
  await expect(edits).toHaveCount(1);
  await edits.press('Enter'); await stock.fill('0');
  await page.getByRole('button', { name: '保存', exact: true }).press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  assert.equal((await inventoryData(page))[3].stock, 0);
  if (!prototype) await expect(page.locator('[id$="--allStock"]')).toHaveText('49');
  if (language) {
    await page.getByRole('combobox', { name: '界面语言', exact: true }).press('Space');
    await page.getByRole('option', { name: 'English', exact: true }).click();
    await page.waitForURL(/sap-ui-language=en/);
    await expect(page.getByRole('button', { name: /Edit$/ })).toHaveCount(6, { timeout: 45000 });
    assert.deepEqual(await inventoryData(page), products, '语言重载恢复固定数据');
  }
  console.log(`${lesson}：context ${JSON.stringify(identity)}；键盘取消 3/52、保存 8/57；空白/负数拒绝、0 合法；清空筛选六件；i18n。`);
}

if (process.argv[1]?.endsWith('/ui5-check.mjs')) {
  const checkpoint = JSON.parse(await readFile(new URL('../checkpoint.json', import.meta.url))).checkpoint;
  await withUI5(({ page, url }) => checkInventory(page, url, {
    prototype: /^P4/.test(checkpoint), lesson: process.argv[2] ?? 'C41',
  }));
}
