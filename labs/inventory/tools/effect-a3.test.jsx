import React, {StrictMode} from 'react';
import {test,expect,vi,afterEach} from 'vitest';
import {render,cleanup,fireEvent,act} from '@testing-library/react';
import {useInventoryShortcuts} from '../src/react/useInventoryShortcuts.js';
import StockActions from '../src/react/StockActions.jsx';
import seed from '../data/products.json' with {type:'json'};
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});
function Harness({count=6,onRestock}) {useInventoryShortcuts(count,onRestock);return <p>库存页</p>;}
test('StrictMode：setup/cleanup/setup后一次键只执行一次；更换回调/卸载/重挂载均正确',()=>{
 document.title='进入前';const first=vi.fn();const second=vi.fn();
 const view=render(<StrictMode><Harness onRestock={first}/></StrictMode>);
 fireEvent.keyDown(window,{key:'ArrowUp',altKey:true});
 expect(first).toHaveBeenCalledExactlyOnceWith('P001',1);
 view.rerender(<StrictMode><Harness count={5} onRestock={second}/></StrictMode>);
 fireEvent.keyDown(window,{key:'ArrowUp',altKey:true});
 expect(first).toHaveBeenCalledTimes(1);expect(second).toHaveBeenCalledTimes(1);
 expect(document.title).toBe('库存工作台 · 5 件商品');
 view.unmount();expect(document.title).toBe('进入前');
 fireEvent.keyDown(window,{key:'ArrowUp',altKey:true});expect(second).toHaveBeenCalledTimes(1);
 const again=render(<StrictMode><Harness onRestock={first}/></StrictMode>);
 fireEvent.keyDown(window,{key:'ArrowUp',altKey:true});expect(first).toHaveBeenCalledTimes(2);
 again.unmount();
});
test('按住产生repeat/已处理/输入法事件不会增加业务动作',()=>{
 const onRestock=vi.fn();render(<Harness onRestock={onRestock}/>);
 fireEvent.keyDown(window,{key:'ArrowUp',altKey:true,repeat:true});
 fireEvent.keyDown(window,{key:'ArrowUp',altKey:true,isComposing:true});
 const event=new KeyboardEvent('keydown',{key:'ArrowUp',altKey:true,cancelable:true});
 event.preventDefault();window.dispatchEvent(event);expect(onRestock).not.toHaveBeenCalled();
});
test('卸载补货行清除仍在等待的timer，不回调业务',async()=>{
 vi.useFakeTimers();const onRestock=vi.fn();
 const view=render(<StockActions product={seed[0]} onRestock={onRestock}/>);
 fireEvent.click(view.getByRole('button',{name:'延迟补三件'}));view.unmount();
 await act(async()=>vi.runAllTimers());expect(onRestock).not.toHaveBeenCalled();
});
