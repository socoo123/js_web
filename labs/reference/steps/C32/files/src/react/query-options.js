// region query-options
export const inventoryKeys = {
  all: ["inventory"],
  list: () => ["inventory", "list"],
  detail: (id) => ["inventory", "detail", id],
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
