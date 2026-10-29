import React from 'react';
import {test,expect,vi,afterEach} from 'vitest';
import {render,cleanup,screen,waitFor,act} from '@testing-library/react';
import {QueryClient} from '@tanstack/react-query';
import {createInventoryRepository,reactStorageKey} from '../src/services/inventory-repository.js';
import {inventoryKeys,listOptions,detailOptions} from '../src/react/query-options.js';
import {InventoryProvider,useInventory} from '../src/react/InventoryProvider.jsx';
import ProductDetail from '../src/react/ProductDetail.jsx';
import seed from '../data/products.json' with {type:'json'};
const clients=[];
afterEach(()=>{cleanup();clients.splice(0).forEach(client=>client.clear());vi.restoreAllMocks();});
function client(){const value=new QueryClient({defaultOptions:{queries:{gcTime:Infinity,retry:false}}});clients.push(value);return value;}
function memory(){const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};}
const repo=(storage=null)=>createInventoryRepository({storage,seed,delay:0});
test('repository返回Promise与独立副本；保存、并发补货和刷新同一真相',async()=>{
 const storage=memory();const repository=repo(storage);
 const promise=repository.list();expect(promise).toBeInstanceOf(Promise);
 const copy=await promise;copy[0].tags.push('污染');copy[0].stock=999;
 expect(await repository.get('P001')).toEqual(seed[0]);
 await Promise.all([repository.restock('P001',1),repository.restock('P001',1),repository.restock('P001',1)]);
 expect((await repository.get('P001')).stock).toBe(15);
 expect((await repo(storage).get('P001')).stock).toBe(15);
 await repository.save({...seed[3],stock:8});
 const products=await repository.list();expect(products.reduce((sum,item)=>sum+item.stock,0)).toBe(60);
 expect(JSON.parse(storage.getItem(reactStorageKey)).products).toEqual(products);
});
test('非法输入/模拟写失败/容量失败不改业务内存和好快照',async()=>{
 const storage=memory();const repository=repo(storage);await repository.saveSnapshot();
 const good=storage.getItem(reactStorageKey);
 await expect(repository.save({...seed[0],stock:''})).rejects.toThrow();
 repository.failNext('save');await expect(repository.save({...seed[0],stock:30})).rejects.toThrow('模拟 save 失败');
 await expect(repository.importText('{bad')).rejects.toThrow();
 expect(await repository.list()).toEqual(seed);expect(storage.getItem(reactStorageKey)).toBe(good);
 const original=storage.setItem;
 storage.setItem=(key,value)=>{if(key===reactStorageKey)throw new Error('容量不足');original(key,value);};
 await expect(repository.restock('P001',1)).rejects.toThrow('容量不足');
 expect((await repository.get('P001')).stock).toBe(12);expect(storage.getItem(reactStorageKey)).toBe(good);
});
test('新建/删除/不存在/取消；损坏后恢复和导入不靠旧state',async()=>{
 const storage=memory();const repository=repo(storage);
 await repository.saveSnapshot();await repository.restock('P004',5);
 await repository.create({...seed[0],id:'P007'});await repository.remove('P007');
 await expect(repository.get('P007')).rejects.toThrow('404');
 const controller=new AbortController();const pending=repository.list({delay:1000,signal:controller.signal});controller.abort();
 await expect(pending).rejects.toMatchObject({name:'AbortError'});
 storage.setItem(reactStorageKey,'{bad');const broken=repo(storage);
 await expect(broken.list()).rejects.toThrow();expect(storage.getItem(reactStorageKey)).toBe('{bad');
 await broken.recover();expect((await broken.get('P004')).stock).toBe(8);
 expect(storage.getItem(reactStorageKey+':damaged')).toBe('{bad');
 await broken.importText(JSON.stringify({version:1,products:seed}));expect(await broken.list()).toEqual(seed);
 expect(JSON.parse(await broken.exportText()).products).toEqual(seed);
});
test('两ID缓存隔离、同键并发复用、新鲜缓存不重复读取',async()=>{
 const repository=repo();const get=vi.spyOn(repository,'get');const queryClient=client();
 const options=detailOptions(repository,'P001');
 const [a,b]=await Promise.all([queryClient.fetchQuery(options),queryClient.fetchQuery(options)]);
 expect(a.id).toBe('P001');expect(b.id).toBe('P001');expect(get).toHaveBeenCalledTimes(1);
 await queryClient.fetchQuery(options);expect(get).toHaveBeenCalledTimes(1);
 const mouse=await queryClient.fetchQuery(detailOptions(repository,'P002'));
 expect(mouse).toEqual(seed[1]);expect(get).toHaveBeenCalledTimes(2);
 expect(queryClient.getQueryData(inventoryKeys.detail('P001')).id).toBe('P001');
 expect(queryClient.getQueryData(inventoryKeys.detail('P002')).stock).toBe(0);
});
test('Provider没有第二份products；await dispatch完成后list/detail同步，其他ID不失效',async()=>{
 const repository=repo();const queryClient=client();let state;
 await queryClient.fetchQuery(detailOptions(repository,'P002'));
 function Probe(){state=useInventory();return <p data-testid="total">{state.products.reduce((sum,item)=>sum+item.stock,0)}</p>;}
 render(<InventoryProvider repository={repository} client={queryClient}><Probe/><ProductDetail productId="P004"/></InventoryProvider>);
 await waitFor(()=>expect(screen.getByTestId('total').textContent).toBe('52'));
 await screen.findByText('P004 USB-C 扩展坞：库存 3');
 await act(async()=>{await state.dispatch({type:'saved',product:{...seed[3],stock:8}});});
 await waitFor(()=>expect(screen.getByTestId('total').textContent).toBe('57'));
 await screen.findByText('P004 USB-C 扩展坞：库存 8');
 expect((await repository.get('P004')).stock).toBe(8);
 expect(queryClient.getQueryState(inventoryKeys.detail('P002')).isInvalidated).toBe(false);
 repository.failNext('save');await act(async()=>{await expect(state.dispatch({type:'saved',product:{...seed[3],stock:9}})).rejects.toThrow();});
 expect(screen.getByTestId('total').textContent).toBe('57');
 await act(async()=>{await state.snapshot.importText(JSON.stringify({version:1,products:seed}));});
 await waitFor(()=>expect(screen.getByTestId('total').textContent).toBe('52'));
 await screen.findByText('P004 USB-C 扩展坞：库存 3');
 expect(queryClient.getQueryState(inventoryKeys.detail('P002')).isInvalidated).toBe(true);
});
test('仓库拒绝读取时Query不自动重试；新查询客户端缓存互不影响',async()=>{
 const repository=repo();const list=vi.spyOn(repository,'list');repository.failNext('list');
 const first=client();await expect(first.fetchQuery(listOptions(repository))).rejects.toThrow();
 expect(list).toHaveBeenCalledTimes(1);
 await first.fetchQuery(detailOptions(repository,'P001'));
 expect(client().getQueryData(inventoryKeys.detail('P001'))).toBeUndefined();
});
