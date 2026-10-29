// Deliberately limited to the synchronous C29–C31 save path; no unrelated old browser flows.
import assert from 'node:assert/strict';
import path from 'node:path';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';
import {viteConfig,workspace} from './lab.mjs';
const id=process.argv[2];if(!/^C(?:29|30|31)$/.test(id??''))throw new Error('C29–C31 only');
const config=await viteConfig(id);config.cacheDir=path.join(workspace,'.lab',`save-overflow-a3-${id}`);
config.server.port=0;config.server.strictPort=false;config.server.hmr=false;
const server=await createServer(config);let browser;const results=[];
try{
 await server.listen();const origin=`http://127.0.0.1:${server.httpServer.address().port}/`;
 browser=await chromium.launch();
 for(const kind of ['编辑','新建']){
  const context=await browser.newContext();const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));const create=kind==='新建';const name=create?'新商品溢出草稿':'保留的键盘草稿';
  const result={id,kind,pageErrors:errors};
  try{
   await page.goto(origin);await expect(page.locator('#list article')).toHaveCount(6);
   await page.getByRole('button',{name:create?'新建商品':'编辑 P001',exact:true}).click();
   const form=page.getByRole('form',{name:'商品编辑'});
   await form.getByLabel('名称',{exact:true}).fill(name);await form.getByLabel('库存',{exact:true}).fill(create?'1':'12');
   await form.getByLabel('价格（元）',{exact:true}).fill('90071992547409.91');
   await form.getByRole('button',{name:'保存',exact:true}).click();
   await expect(form.getByText('汇总超出安全整数范围',{exact:true})).toBeVisible({timeout:1500});
   result.main=await page.locator('main').count();result.form=await form.count();
   assert.equal(result.main,1);assert.equal(result.form,1);
   await expect(form.getByLabel('名称',{exact:true})).toHaveValue(name);
   await expect(form.getByLabel('库存',{exact:true})).toHaveValue(create?'1':'12');
   await expect(form.getByLabel('价格（元）',{exact:true})).toHaveValue('90071992547409.91');
   await expect(page.locator('#summary')).toContainText('库存 52');await expect(page.locator('#summary')).toContainText('2634800 分');
   await expect(page.locator('article[data-id="P001"]')).toContainText('机械键盘');
   await expect(page.locator('article[data-id="P001"]')).toContainText('库存 12 件');
   await expect(page.locator('article[data-id="P007"]')).toHaveCount(0);result.preserved=true;
   await form.getByLabel('价格（元）',{exact:true}).fill(create?'1.00':'399.00');
   await form.getByRole('button',{name:'保存',exact:true}).click();await expect(form).toHaveCount(0);
   await expect(page.locator(`article[data-id="${create?'P007':'P001'}"]`)).toContainText(name);
   await expect(page.locator('#summary')).toContainText(create?'库存 53':'库存 52');
   await expect(page.locator('#summary')).toContainText(create?'2634900 分':'2634800 分');
   result.retry=true;assert.deepEqual(errors,[]);result.passed=true;
  }catch(error){
   result.passed=false;result.failure=error.message;result.main=await page.locator('main').count();result.form=await page.getByRole('form',{name:'商品编辑'}).count();
  }finally{results.push(result);await context.close();}
 }
 console.log(JSON.stringify({id,chromium:browser.version(),results},null,2));
 if(results.some(result=>!result.passed))process.exitCode=1;
}finally{await browser?.close();await server.close();}
