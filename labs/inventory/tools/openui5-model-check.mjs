import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { withUI5 } from './openui5-support.mjs';

await withUI5(async ({ page, url }) => {
  await page.goto(url);
  await expect(page.getByRole('row').filter({ hasText: 'P002' })).toBeVisible({ timeout: 45000 });
  const result = await page.evaluate(() => new Promise((resolve) => sap.ui.require([
    'sap/ui/model/json/JSONModel', 'sap/ui/core/mvc/XMLView',
  ], async (JSONModel, XMLView) => {
    const view = await XMLView.create({ definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"><Text id="stock" text="{inventory>/product/stock}" /></mvc:View>' });
    const model = new JSONModel({ product: { id: 'P002', stock: 0 } });
    view.setModel(model, 'inventory');
    const values = () => [model.getProperty('/product/stock'), view.byId('stock').getText()];
    const states = [values()];
    model.getData().product.stock = 3; states.push(values());
    model.setProperty('/product/stock', 3); states.push(values());
    const mode = model.getDefaultBindingMode();
    view.destroy(); model.destroy(); resolve({ states, mode });
  })));
  assert.deepEqual(result, { states: [[0, '0'], [3, '0'], [3, '3']], mode: 'TwoWay' });
  console.log('C39/C41：真实XMLView绑定：初始0/0，直接赋值3/0，setProperty后3/3；JSONModel默认TwoWay。');
});
