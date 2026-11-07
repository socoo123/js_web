// region provider-root
import React, { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repository as defaultRepository, dataSource as defaultDataSource } from "../services/data-source.js";
import { encodeSnapshot } from "../services/storage.js";
import { inventoryKeys, listOptions } from "./query-options.js";
const InventoryContext = createContext(null);
export function InventoryProvider({ children, repository = defaultRepository, dataSource = defaultDataSource, client }) {
  const [queryClient] = useState(() => client ?? new QueryClient());
  return <QueryClientProvider client={queryClient}>
    <InventoryState repository={repository} dataSource={dataSource}>{children}</InventoryState>
  </QueryClientProvider>;
}
// endregion provider-root
// region provider-mutation
function InventoryState({ children, repository, dataSource }) {
  const queryClient = useQueryClient();
  const list = useQuery(listOptions(repository));
  const [message, report] = useState("");
  // 列表、详情和筛选结果都在 ["inventory"] 之下，写入成功后一起重新读取。
  const refresh = () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
  const mutation = useMutation({
    mutationFn: (action) => {
      switch (action.type) {
        case "saved": return repository.save(action.product, action.options);
        case "created": return repository.create(action.product, action.options);
        case "deleted": return repository.remove(action.id, action.options);
        case "restocked": return repository.restock(action.id, action.amount, action.options);
        case "replaced": return repository.importText(encodeSnapshot(action.products));
        default: throw new Error(`未知 action：${action.type}`);
      }
    },
    onSuccess: refresh,
    // 409 表示本地看到的 version 已过期：重读服务器当前值，草稿仍留在编辑器里。
    onError: (error) => { if (error.status === 409) return refresh(); },
  });
// endregion provider-mutation
// region provider-snapshots
  async function snapshotAction(operation, success) {
    try {
      const result = await operation();
      await refresh();
      report(success); return result;
    } catch (error) { report(`快照操作失败：${error.message}`); return null; }
  }
  const snapshot = {
    message, report,
    save: () => snapshotAction(() => repository.saveSnapshot(), "本地快照已保存"),
    recover: () => snapshotAction(() => repository.recover(), "备份已恢复"),
    importText: (text) => snapshotAction(() => repository.importText(text), "导入完成"),
    exportText: () => repository.exportText(),
    reset: () => snapshotAction(() => repository.reset(), "已恢复固定数据"),
  };
  return <InventoryContext value={{ products: list.data ?? [], dispatch: mutation.mutateAsync, snapshot, repository, queryClient, dataSource }}>
    {list.isPending && <p role="status">正在加载库存</p>}
    {list.isError && <>
      <p role="alert">读取失败：{list.error.message}{dataSource === "mock" && "；可恢复备份或导入快照"}</p>
      <button onClick={() => list.refetch()}>重新读取</button>
    </>}
    {children}
  </InventoryContext>;
}
export function useInventory() {
  const value = useContext(InventoryContext);
  if (value === null) throw new Error("需要 InventoryProvider");
  return value;
}
// endregion provider-snapshots
