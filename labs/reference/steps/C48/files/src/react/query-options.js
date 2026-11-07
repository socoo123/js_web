// region query-options
import { keepPreviousData } from "@tanstack/react-query";
export const inventoryKeys = {
  all: ["inventory"],
  list: () => ["inventory", "list"],
  detail: (id) => ["inventory", "detail", id],
  page: (params) => ["inventory", "page", params],
};
export function listOptions(repository) {
  return { queryKey: inventoryKeys.list(), queryFn: ({ signal }) => repository.list({ signal }), staleTime: 60000, retry: false };
}
export function detailOptions(repository, id, options = {}) {
  return {
    queryKey: inventoryKeys.detail(id),
    queryFn: ({ signal }) => repository.get(id, { ...options, signal }),
    staleTime: 60000, retry: false,
  };
}
// endregion query-options
// region page-options
// 查询条件进入 queryKey：条件变了才是另一份服务器结果；换条件时先保留上一份，避免列表闪空。
export function pageOptions(repository, params) {
  return {
    queryKey: inventoryKeys.page(params),
    queryFn: ({ signal }) => repository.listPage(params, { signal }),
    staleTime: 60000, retry: false, placeholderData: keepPreviousData,
  };
}
// endregion page-options
