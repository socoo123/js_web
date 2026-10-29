// C29–C31 only: direct actual App regression, not an onSave/reducer mock or a later Action contract.
import React from 'react';
import {test,expect,afterEach} from 'vitest';
import {render,screen,within,fireEvent,cleanup} from '@testing-library/react';
import App from '../src/react/App.jsx';
import seed from '../data/products.json' with {type:'json'};
import {toDraft,parseDraft,summarize} from '../src/core/inventory.js';
afterEach(()=>{cleanup();localStorage.clear();window.location.hash='';});
const price='90071992547409.91';
test.each(['编辑','新建'])('实际App%s：全量汇总溢出不卸载，草稿/52/2634800保留，修正后可重试',async kind=>{
 const create=kind==='新建';const name=create?'新商品溢出草稿':'保留的键盘草稿';
 const parsed=parseDraft({...toDraft(seed[0]),name,stock:create?'1':'12',price});
 expect(parsed.hasErrors).toBe(false);expect(parsed.value.priceCents).toBe(Number.MAX_SAFE_INTEGER);
 if(create)expect(summarize([parsed.value]).valueCents).toBe(Number.MAX_SAFE_INTEGER);
 render(<App/>);
 fireEvent.click(await screen.findByRole('button',{name:create?'新建商品':'编辑 P001',exact:true}));
 const form=await screen.findByRole('form',{name:'商品编辑'});const fields=within(form);
 fireEvent.change(fields.getByLabelText('名称',{exact:true}),{target:{value:name}});
 fireEvent.change(fields.getByLabelText('库存',{exact:true}),{target:{value:create?'1':'12'}});
 fireEvent.change(fields.getByLabelText('价格（元）',{exact:true}),{target:{value:price}});
 // Observe a real reducer-render exception as well as the removed main/form in the red implementation.
 let thrown;try{fireEvent.submit(form);}catch(error){thrown=error;}
 expect(document.querySelector('main'),`溢出不能卸载main；渲染异常=${thrown?.message??'无'}`).not.toBeNull();
 expect(screen.getByRole('form',{name:'商品编辑'})).toBe(form);
 expect(await fields.findByText('汇总超出安全整数范围',{exact:true})).toBeTruthy();
 expect(fields.getByLabelText('名称',{exact:true}).value).toBe(name);
 expect(fields.getByLabelText('价格（元）',{exact:true}).value).toBe(price);
 expect(fields.getByLabelText('库存',{exact:true}).value).toBe(create?'1':'12');
 expect(document.querySelector('#summary').textContent).toContain('库存 52');
 expect(document.querySelector('#summary').textContent).toContain('2634800 分');
 expect(document.querySelector('article[data-id="P001"]').textContent).toContain('机械键盘');
 expect(document.querySelector('article[data-id="P001"]').textContent).toContain('库存 12 件');
 expect(document.querySelector('article[data-id="P007"]')).toBeNull();
 fireEvent.change(fields.getByLabelText('价格（元）',{exact:true}),{target:{value:create?'1.00':'399.00'}});
 fireEvent.submit(form);
 expect(screen.queryByRole('form',{name:'商品编辑'})).toBeNull();
 const saved=document.querySelector(`article[data-id="${create?'P007':'P001'}"]`);
 expect(saved.textContent).toContain(name);expect(saved.textContent).toContain(create?'库存 1 件':'库存 12 件');
 expect(document.querySelector('#summary').textContent).toContain(create?'库存 53':'库存 52');
 expect(document.querySelector('#summary').textContent).toContain(create?'2634900 分':'2634800 分');
});
