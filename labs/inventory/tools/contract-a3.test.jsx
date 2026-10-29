import React from 'react';
import {test,expect,afterEach,vi} from 'vitest';
import {render,fireEvent,cleanup,act} from '@testing-library/react';
import ProductEditor from '../src/react/ProductEditor.jsx';
import StockActions from '../src/react/StockActions.jsx';
import seed from '../data/products.json' with {type:'json'};
afterEach(()=>{cleanup();vi.useRealTimers();});
test('真实C28表单契约跨课保留：noValidate/autoFocus/关联错误/显式首错顺序与合法0',()=>{
 const onSave=vi.fn();const view=render(<ProductEditor product={seed[0]} onSave={onSave} onCancel={()=>{}}/>);
 const form=view.getByRole('form',{name:'商品编辑'});
 const name=view.getByLabelText('名称',{exact:true});const stock=view.getByLabelText('库存',{exact:true});
 const price=view.getByLabelText('价格（元）',{exact:true});const category=view.getByLabelText('编辑分类',{exact:true});
 expect(form.noValidate).toBe(true);expect(document.activeElement).toBe(name);
 for(const [field,value]of [[name,' '],[stock,''],[price,''],[category,'']])fireEvent.change(field,{target:{value}});
 for(const [field,value]of [[name,'机械键盘'],[stock,'0'],[price,'0.29'],[category,'外设']]){
  fireEvent.submit(form);expect(document.activeElement).toBe(field);
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(document.getElementById(field.getAttribute('aria-describedby')).textContent.length).toBeGreaterThan(0);
  expect(onSave).not.toHaveBeenCalled();fireEvent.change(field,{target:{value}});
 }
 fireEvent.submit(form);expect(onSave).toHaveBeenCalledExactlyOnceWith({...seed[0],stock:0,priceCents:29});
});
test('真实C28计时契约跨课保留：2000ms、重新安排替换旧截止点、waiting重渲染后仍能取消',()=>{
 vi.useFakeTimers();const onRestock=vi.fn();const view=render(<StockActions product={seed[0]} onRestock={onRestock}/>);
 const delay=view.getByRole('button',{name:'延迟补三件'});const cancel=view.getByRole('button',{name:'取消盘点'});
 fireEvent.click(delay);expect(cancel.disabled).toBe(false);expect(view.getByText('盘点等待中')).toBeTruthy();
 act(()=>vi.advanceTimersByTime(1999));expect(onRestock).not.toHaveBeenCalled();
 act(()=>vi.advanceTimersByTime(1));expect(onRestock).toHaveBeenCalledExactlyOnceWith('P001',3);expect(cancel.disabled).toBe(true);
 fireEvent.click(delay);act(()=>vi.advanceTimersByTime(1000));fireEvent.click(delay);act(()=>vi.advanceTimersByTime(1000));
 expect(onRestock).toHaveBeenCalledTimes(1);fireEvent.click(cancel);act(()=>vi.advanceTimersByTime(2100));
 expect(onRestock).toHaveBeenCalledTimes(1);expect(cancel.disabled).toBe(true);expect(view.queryByText('盘点等待中')).toBeNull();
});
