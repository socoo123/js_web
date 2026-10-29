import assert from 'node:assert/strict';
import {createServer as createHttpServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {createServer,build} from 'vite';
import {chromium,expect} from '@playwright/test';
import {viteConfig,workspace} from './lab.mjs';
const id=process.argv[2];const n=Number(id.slice(1));
const config=await viteConfig(id);config.cacheDir=path.join(workspace,'.lab',`vite-a3-${id}`);config.server.port=0;config.server.strictPort=false;config.server.hmr=false;
const server=await createServer(config);let browser;let http;
try {
 await server.listen();const address=server.httpServer.address();const origin=`http://127.0.0.1:${address.port}/`;
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:360,height:900}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin);await expect(page.locator('#list article')).toHaveCount(6);
 if(n===29){
  const row=page.locator('article[data-id="P001"]');
  await page.keyboard.press('Alt+ArrowUp');await expect(row).toContainText('库存 13 件');
  await page.getByPlaceholder('名称或编号').fill('P004');assert.equal(await page.title(),'库存工作台 · 6 件商品');
  await page.getByPlaceholder('名称或编号').fill('');await page.keyboard.press('Alt+ArrowUp');await expect(row).toContainText('库存 14 件');
  await page.clock.install();await row.getByRole('button',{name:'延迟补三件'}).click();
  await page.getByPlaceholder('名称或编号').fill('P004');await expect(row).toHaveCount(0);await page.clock.runFor(2300);
  await page.getByPlaceholder('名称或编号').fill('');await expect(row).toContainText('库存 14 件');
 }
 if(n===30){
  const firstResponse=page.waitForResponse(response=>response.url().includes('products.json?product=P001'));
  await page.getByRole('button',{name:'详情 P001',exact:true}).click();await firstResponse;
  await page.getByRole('button',{name:'详情 P002',exact:true}).click();
  await expect(page.getByRole('region',{name:'商品详情'})).toContainText('P002 无线鼠标：库存 0');
  await page.getByLabel('模拟读取失败',{exact:true}).check();
  await expect(page.getByRole('alert')).toContainText('模拟读取失败');
  await page.getByLabel('模拟读取失败',{exact:true}).uncheck();
  await expect(page.getByRole('region',{name:'商品详情'})).toContainText('P002 无线鼠标');
  await page.getByRole('button',{name:'关闭详情',exact:true}).click();await expect(page.getByRole('region',{name:'商品详情'})).toHaveCount(0);
 }
 if(n>=31){
  await page.getByRole('link',{name:'详情 P004',exact:true}).click();
  await expect(page.getByRole('region',{name:'商品详情'})).toContainText('P004 USB-C 扩展坞：库存 3');
  await page.getByRole('button',{name:'编辑 P004',exact:true}).click();
  const form=page.getByRole('form',{name:'商品编辑'});await form.getByLabel('库存',{exact:true}).fill('8');
  await form.getByRole('button',{name:'保存',exact:true}).click();
  await expect(page.locator('#summary')).toContainText('库存 57');
  await expect(page.getByRole('button',{name:'编辑 P004',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'保存本地快照',exact:true}).click();await expect(page.getByRole('region',{name:'本地库存快照'})).toContainText('本地快照已保存');
  await page.getByPlaceholder('名称或编号').fill('P004');await page.reload();
  await expect(page.getByPlaceholder('名称或编号')).toHaveValue('P004');
  await expect(page.locator('article[data-id="P004"]')).toContainText('库存 8 件');
  await expect(page.getByRole('region',{name:'商品详情'})).toContainText(`库存 ${n===31?3:8}`);
  await page.getByLabel('导入快照',{exact:true}).setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
  await expect(page.getByRole('region',{name:'本地库存快照'})).toContainText(n===31?'导入失败':'快照操作失败');
  await expect(page.locator('article[data-id="P004"]')).toContainText('库存 8 件');
  if(n===32){
   await page.getByRole('button',{name:'模拟详情失败',exact:true}).click();
   await expect(page.getByRole('region',{name:'商品详情'})).toContainText('模拟 get 失败');
   await expect(page.getByRole('region',{name:'商品详情'})).toContainText('库存 8');
   await page.getByRole('button',{name:'重试详情',exact:true}).click();
   await expect(page.getByRole('region',{name:'商品详情'}).getByRole('alert')).toHaveCount(0);
  }
  await page.getByRole('link',{name:'返回列表',exact:true}).click();
  await expect(page.getByText('选择商品查看详情',{exact:true})).toBeVisible();
  await page.goBack();await expect(page.getByRole('region',{name:'商品详情'})).toContainText('P004');
  await page.goto(origin+'#/products/P999');await expect(page.getByRole('region',{name:'商品详情'})).toContainText('404');
  await page.goto(origin+'#/unknown');await expect(page.getByText('未找到页面',{exact:true})).toBeVisible();
  await page.goto(origin+'#/products/P004?q=P004&order=unknown&category=unknown');
  await expect(page.getByLabel('排序',{exact:true})).toHaveValue('id');await expect(page.getByLabel('分类',{exact:true})).toHaveValue('全部');
  const production=await viteConfig(id,true);production.cacheDir=path.join(workspace,'.lab',`vite-a3-${id}`);production.logLevel='error';await build(production);
  const base='/js_web/demos/inventory/';const root=production.build.outDir;
  http=createHttpServer(async(req,res)=>{
   try {
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(!pathname.startsWith(base))throw new Error('outside base');
    const relative=decodeURIComponent(pathname.slice(base.length))||'index.html';
    const file=path.resolve(root,relative);if(!file.startsWith(path.resolve(root)+path.sep))throw new Error('unsafe');
    if(!(await stat(file)).isFile())throw new Error('not a file');
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
    res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');res.end(await readFile(file));
   }catch{res.writeHead(404);res.end('not found');}
  });
  await new Promise(resolve=>http.listen(0,'127.0.0.1',resolve));
  const staticOrigin=`http://127.0.0.1:${http.address().port}`;
  const missing=await fetch(staticOrigin+base+'products/P004');assert.equal(missing.status,404);
  await page.goto(staticOrigin+base+'#/products/P004?q=P004');
  await expect(page.getByRole('region',{name:'商品详情'})).toContainText('P004 USB-C 扩展坞：库存 3');
  await page.reload();await expect(page.getByRole('region',{name:'商品详情'})).toContainText('P004 USB-C 扩展坞：库存 3');
  console.log(`${id} strict static ${base} hash detail/refresh passed; history path returns 404 (no fallback).`);
 }
 async function preservedCase(callback){
  const context=await browser.newContext({viewport:{width:360,height:900}});const current=await context.newPage();
  current.on('pageerror',error=>errors.push(error.message));
  try {await current.goto(origin);await expect(current.locator('#list article')).toHaveCount(6);await callback(current);}
  finally {await context.close();}
 }
 await preservedCase(async current=>{
  const edit=current.getByRole('button',{name:'编辑 P001',exact:true});await edit.click();
  const form=current.getByRole('form',{name:'商品编辑'});assert.equal(await form.evaluate(node=>node.noValidate),true);
  await expect(form.getByLabel('名称',{exact:true})).toBeFocused();
  await form.getByRole('button',{name:'取消',exact:true}).click();await expect(edit).toBeFocused();
  await edit.click();await current.getByPlaceholder('名称或编号').fill('P002');
  await form.getByRole('button',{name:'取消',exact:true}).click();
  await expect(current.getByRole('heading',{level:1})).toHaveAttribute('tabindex','-1');
  await expect(current.getByRole('heading',{level:1})).toBeFocused();
 });
 await preservedCase(async current=>{
  await current.getByPlaceholder('名称或编号').fill('鼠标');await current.getByRole('button',{name:'编辑 P002',exact:true}).click();
  const form=current.getByRole('form',{name:'商品编辑'});await form.getByLabel('名称',{exact:true}).fill('办公指针');
  await form.getByRole('button',{name:'保存',exact:true}).click();
  await expect(current.locator('article[data-id="P002"]')).toHaveCount(0);await expect(form).toHaveCount(0);
  await expect(current.getByRole('heading',{level:1})).toBeFocused();
 });
 await preservedCase(async current=>{
  const first=current.locator('article[data-id="P001"]');
  await first.getByRole('button',{name:'连续补三件',exact:true}).click();
  await expect(first.getByRole('status')).toContainText('15 件');await expect(current.locator('#summary')).toContainText('库存 55');
 });
 await preservedCase(async current=>{
  const first=current.locator('article[data-id="P001"]');await current.clock.install();
  await first.getByRole('button',{name:'延迟补三件',exact:true}).click();
  await first.getByRole('button',{name:'立即补一件',exact:true}).click();await current.clock.runFor(300);
  await expect(first.getByRole('status')).toContainText('13 件');await current.clock.runFor(2100);
  await expect(first.getByRole('status')).toContainText('16 件');await expect(current.locator('#summary')).toContainText('库存 56');
 });
 await preservedCase(async current=>{
  const first=current.locator('article[data-id="P001"]');await current.clock.install();
  await first.getByRole('button',{name:'延迟补三件',exact:true}).click();
  await expect(first.getByText('盘点等待中',{exact:true})).toBeVisible();
  await first.getByRole('button',{name:'取消盘点',exact:true}).click();await current.clock.runFor(2300);
  await expect(first.getByRole('status')).toContainText('12 件');
  await first.getByRole('button',{name:'延迟补三件',exact:true}).click();
  await current.getByPlaceholder('名称或编号').fill('P002');await expect(first).toHaveCount(0);await current.clock.runFor(2300);
  await current.getByPlaceholder('名称或编号').fill('');await expect(first.getByRole('status')).toContainText('12 件');
 });
 console.log(`${id} actual C28 preservation: 12→15/16, 2000ms timer cancel/unmount, noValidate/autofocus, cancel return/fallback, save-filter fallback passed.`);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log(`${id} Chromium current-source behaviors passed; page errors 0.`);
} finally {await browser?.close();await server.close();if(http)await new Promise(resolve=>http.close(resolve));}
