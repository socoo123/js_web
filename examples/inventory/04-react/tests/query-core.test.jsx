import { it, expect, vi } from "vitest";
import { createInventoryQueryClient } from "../src/query-client.js";
import { createMockProductService } from "../src/mock-product-service.js";
import { products } from "../../../shared/products.js";

it("staleTime 到期不会主动请求，下一次 fetchQuery 才读取新值", async () => {
  const client = createInventoryQueryClient();
  const load = vi.fn(async () => ({ stock: 12 }));
  const options = { queryKey: ["products", "detail", "P001"], queryFn: load, staleTime: 10 };
  vi.useFakeTimers();
  try {
    await client.fetchQuery(options);
    await vi.advanceTimersByTimeAsync(11);
    expect(load).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(options.queryKey).stock).toBe(12);
    await client.fetchQuery(options);
    expect(load).toHaveBeenCalledTimes(2);
  } finally { client.clear(); vi.useRealTimers(); }
});

it("gcTime 只在无观察者后回收，失效本身保留数据", async () => {
  const client = createInventoryQueryClient();
  vi.useFakeTimers();
  try {
    const key = ["products", "detail", "P001"];
    await client.fetchQuery({ queryKey: key, queryFn: async () => ({ stock: 12 }), gcTime: 20 });
    await client.invalidateQueries({ queryKey: key });
    expect(client.getQueryData(key).stock).toBe(12);
    await vi.advanceTimersByTimeAsync(21);
    expect(client.getQueryData(key)).toBeUndefined();
  } finally { client.clear(); vi.useRealTimers(); }
});

it("retry 1 意味着总共两次读取，成功后保留结果", async () => {
  const client = createInventoryQueryClient();
  const load = vi.fn().mockRejectedValueOnce(new Error("临时失败")).mockResolvedValue(products[0]);
  try {
    await client.fetchQuery({ queryKey: ["products", "detail", "P001"], queryFn: load, retry: 1, retryDelay: 0 });
    expect(load).toHaveBeenCalledTimes(2);
  } finally { client.clear(); }
});

it("mock 写入后读回新值，源数据不变，新服务实例重新从固定值开始", async () => {
  vi.useFakeTimers();
  const loadProduct = vi.fn(async () => structuredClone(products[0]));
  const service = createMockProductService({ loadProduct });
  try {
    const writing = service.restock("P001"); await vi.runAllTimersAsync();
    expect((await writing).stock).toBe(13);
    const reading = service.getProduct("P001"); await vi.runAllTimersAsync();
    expect((await reading).stock).toBe(13);
    expect(products[0].stock).toBe(12);
    const fresh = createMockProductService({ loadProduct }).getProduct("P001"); await vi.runAllTimersAsync();
    expect((await fresh).stock).toBe(12);
  } finally { vi.useRealTimers(); }
});
