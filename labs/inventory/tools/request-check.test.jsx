import React from 'react';
import {test,expect,afterEach,vi} from 'vitest';
import {render,screen,cleanup,fireEvent,act} from '@testing-library/react';
import ProductDetail from '../src/react/ProductDetail.jsx';
import seed from '../data/products.json' with {type:'json'};
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });
function controlled() {
 const jobs=[];
 const loadProduct=(id,{signal})=>new Promise((resolve,reject)=>jobs.push({id,resolve,reject,signal}));
 return {jobs,loadProduct};
}
test('真实详情组件：忽略Abort的旧响应仍不能覆盖P002',async()=>{
 const jobs=new Map();const loadProduct=(id,{signal})=>new Promise(resolve=>jobs.set(id,{resolve,signal}));
 const view=render(<ProductDetail productId="P001" loadProduct={loadProduct}/>);
 view.rerender(<ProductDetail productId="P002" loadProduct={loadProduct}/>);
 expect(jobs.get('P001').signal.aborted).toBe(true);
 await act(async()=>jobs.get('P002').resolve(seed[1]));
 expect(screen.getByRole('region',{name:'商品详情'}).textContent).toContain('P002 无线鼠标');
 await act(async()=>jobs.get('P001').resolve(seed[0]));
 expect(screen.getByRole('region',{name:'商品详情'}).textContent).toContain('P002 无线鼠标');
 view.unmount();expect(jobs.get('P002').signal.aborted).toBe(true);
});
test('旧成功完成时，新请求仍保持loading；旧失败也不能污染新成功',async()=>{
 const {jobs,loadProduct}=controlled();
 const view=render(<ProductDetail productId="P001" loadProduct={loadProduct}/>);
 view.rerender(<ProductDetail productId="P002" loadProduct={loadProduct}/>);
 await act(async()=>jobs[0].resolve(seed[0]));
 expect(screen.getByRole('status').textContent).toBe('正在加载 P002');
 await act(async()=>jobs[1].resolve(seed[1]));
 view.rerender(<ProductDetail productId="P001" loadProduct={loadProduct}/>);
 view.rerender(<ProductDetail productId="P002" loadProduct={loadProduct}/>);
 await act(async()=>jobs[3].resolve(seed[1]));
 await act(async()=>jobs[2].reject(new Error('旧请求失败')));
 expect(screen.queryByRole('alert')).toBeNull();
 expect(screen.getByRole('region',{name:'商品详情'}).textContent).toContain('P002 无线鼠标');
});
test('A→B→A，同ID的第一轮也已过期；每轮signal独立',async()=>{
 const {jobs,loadProduct}=controlled();
 const view=render(<ProductDetail productId="P001" loadProduct={loadProduct}/>);
 view.rerender(<ProductDetail productId="P002" loadProduct={loadProduct}/>);
 view.rerender(<ProductDetail productId="P001" loadProduct={loadProduct}/>);
 expect(new Set(jobs.map(job=>job.signal)).size).toBe(3);
 expect(jobs.map(job=>job.signal.aborted)).toEqual([true,true,false]);
 await act(async()=>jobs[2].resolve({...seed[0],stock:15}));
 await act(async()=>jobs[0].resolve(seed[0]));
 expect(screen.getByRole('region',{name:'商品详情'}).textContent).toContain('库存 15');
});
test('当前错误可重试，卸载后成功/失败均无界面回写',async()=>{
 const {jobs,loadProduct}=controlled();
 const view=render(<ProductDetail productId="P001" loadProduct={loadProduct}/>);
 await act(async()=>jobs[0].reject(new Error('HTTP 404')));
 expect(screen.getByRole('alert').textContent).toBe('HTTP 404');
 fireEvent.click(screen.getByRole('button',{name:'重试详情'}));
 expect(screen.getByRole('status').textContent).toBe('正在加载 P001');
 view.unmount();
 expect(jobs[1].signal.aborted).toBe(true);
 await act(async()=>jobs[1].resolve(seed[0]));
 expect(screen.queryByRole('region')).toBeNull();
 const second=render(<ProductDetail productId="P002" loadProduct={loadProduct}/>);
 second.unmount();
 await act(async()=>jobs[2].reject(new Error('卸载后的失败')));
 expect(screen.queryByRole('alert')).toBeNull();
});
test('两个详情实例：重试A不会取消或重启B',async()=>{
 const {jobs,loadProduct}=controlled();
 render(<><ProductDetail productId="P001" loadProduct={loadProduct}/><ProductDetail productId="P002" loadProduct={loadProduct}/></>);
 await act(async()=>{ jobs[0].resolve(seed[0]); jobs[1].resolve(seed[1]); });
 fireEvent.click(screen.getAllByRole('button',{name:'重试详情'})[0]);
 expect(jobs.map(job=>job.id)).toEqual(['P001','P002','P001']);
 expect(jobs[1].signal.aborted).toBe(false);
 expect(screen.getAllByRole('region',{name:'商品详情'})[1].textContent).toContain('P002 无线鼠标');
});
