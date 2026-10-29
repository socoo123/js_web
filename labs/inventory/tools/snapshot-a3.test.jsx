import React from 'react';
import {test,expect,afterEach} from 'vitest';
import {render,cleanup,fireEvent,screen,act} from '@testing-library/react';
import {InventoryProvider,useInventory,reactStorageKey} from '../src/react/InventoryProvider.jsx';
import seed from '../data/products.json' with {type:'json'};
import {storageKey,saveProducts,readProducts,recoverProducts} from '../src/services/storage.js';
afterEach(()=>{cleanup();localStorage.clear();});
let state;
function Probe(){state=useInventory();return <><p>{state.products[0].stock}</p><button onClick={()=>state.dispatch({type:'restocked',id:'P001',amount:3})}>补货</button></>;}
test('C31只显式保存，重挂载从快照恢复；坏导入不覆盖好原文',async()=>{
 const view=render(<InventoryProvider><Probe/></InventoryProvider>);
 expect(localStorage.getItem(reactStorageKey)).toBeNull();fireEvent.click(screen.getByRole('button',{name:'补货'}));
 expect(state.products[0].stock).toBe(15);expect(localStorage.getItem(reactStorageKey)).toBeNull();
 await act(async()=>state.snapshot.save());
 const good=localStorage.getItem(reactStorageKey);view.unmount();
 const next=render(<InventoryProvider><Probe/></InventoryProvider>);expect(state.products[0].stock).toBe(15);
 await act(async()=>state.snapshot.importText('{bad'));
 expect(localStorage.getItem(reactStorageKey)).toBe(good);expect(state.products[0].stock).toBe(15);
 expect(state.snapshot.message).toContain('导入失败');next.unmount();
});
test('损坏主快照不自动写回；可从独立有效备份恢复',async()=>{
 localStorage.setItem(reactStorageKey,'{bad');
 localStorage.setItem(reactStorageKey+':backup',JSON.stringify({version:1,products:seed}));
 render(<InventoryProvider><Probe/></InventoryProvider>);
 expect(state.snapshot.message).toContain('读取失败');expect(localStorage.getItem(reactStorageKey)).toBe('{bad');
 await act(async()=>state.snapshot.recover());
 expect(state.products).toEqual(seed);expect(localStorage.getItem(reactStorageKey+':damaged')).toBe('{bad');
});
test('storage可选key保持原生默认契约，React快照不覆盖vanilla键',()=>{
 const map=new Map();const storage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};
 saveProducts(storage,seed);saveProducts(storage,seed.map(product=>product.id==='P004'?{...product,stock:8}:product),reactStorageKey);
 expect(readProducts(storage)).toEqual(seed);expect(readProducts(storage,reactStorageKey)[3].stock).toBe(8);
 saveProducts(storage,seed);storage.setItem(storageKey,'{bad');
 expect(recoverProducts(storage)).toEqual(seed);expect(storage.getItem(storageKey+':damaged')).toBe('{bad');
 expect(readProducts(storage,reactStorageKey)[3].stock).toBe(8);
});
