// region provider-root
import React, { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repository as defaultRepository } from "../services/inventory-repository.js";
import { encodeSnapshot } from "../services/storage.js";
import { inventoryKeys, listOptions } from "./query-options.js";
const InventoryContext = createContext(null);
export function InventoryProvider({ children, repository = defaultRepository, client }) {
  const [queryClient] = useState(() => client ?? new QueryClient());
  return <QueryClientProvider client={queryClient}>
    <InventoryState repository={repository}>{children}</InventoryState>
  </QueryClientProvider>;
}
// endregion provider-root
// region provider-mutation
function InventoryState({ children, repository }) {
  const queryClient = useQueryClient();
  const list = useQuery(listOptions(repository));
  const [message, report] = useState("");
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
    onSuccess: async (_, action) => {
      if (action.type === "replaced") await queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      else await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.list(), exact: true }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(action.product?.id ?? action.id), exact: true }),
      ]);
    },
  });
// endregion provider-mutation
// region provider-snapshots
  async function snapshotAction(operation, success) {
    try {
      const result = await operation();
      await queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      report(success); return result;
    } catch (error) { report(`快照操作失败：${error.message}`); return null; }
  }
  const snapshot = {
    message, report,
    save: () => snapshotAction(() => repository.saveSnapshot(), "本地快照已保存"),
    recover: () => snapshotAction(() => repository.recover(), "备份已恢复"),
    importText: (text) => snapshotAction(() => repository.importText(text), "导入完成"),
    exportText: () => repository.exportText(),
  };
  return <InventoryContext value={{ products: list.data ?? [], dispatch: mutation.mutateAsync, snapshot, repository, queryClient }}>
    {list.isPending && <p role="status">正在加载库存</p>}
    {list.isError && <p role="alert">读取失败：{list.error.message}；可恢复备份或导入快照</p>}
    {children}
  </InventoryContext>;
}
export function useInventory() {
  const value = useContext(InventoryContext);
  if (value === null) throw new Error("需要 InventoryProvider");
  return value;
}
// endregion provider-snapshots
