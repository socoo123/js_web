// region api-error
export class ApiError extends Error {
  constructor(status, { code = "HTTP", message, fields, current } = {}) {
    super(message ? `HTTP ${status}：${message}` : `HTTP ${status}`);
    this.name = "ApiError";
    Object.assign(this, { status, code, fields, current });
  }
}
// endregion api-error
// region api-request
const editable = ["name", "category", "stock", "priceCents", "tags"];
export function createApiRepository({ baseUrl = import.meta.env?.VITE_API_BASE ?? "/api", fetch = globalThis.fetch } = {}) {
  const versions = new Map();
  const failures = new Set();
  function remember(product) { versions.set(product.id, product.version); return product; }
  async function send(method, url, { body, headers = {}, signal } = {}) {
    const response = await fetch(url, { method, signal, body: body && JSON.stringify(body),
      headers: body ? { "Content-Type": "application/json", ...headers } : headers });
    if (response.ok) return response.status === 204 ? null : response.json();
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, data?.error);
  }
  // delay 只在浏览器里等，api 终端只标真正注入的故障；fail 由后端注入 500，Network 里看得到。
  function wait(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) { reject(new DOMException("已取消", "AbortError")); return; }
      const abort = () => { clearTimeout(timer); reject(new DOMException("已取消", "AbortError")); };
      const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, ms);
      signal?.addEventListener("abort", abort, { once: true });
    });
  }
  async function call(operation, method, suffix, options = {}, init = {}) {
    const url = baseUrl + suffix;
    if (options.delay) await wait(options.delay, options.signal);
    if (options.fail || failures.delete(operation)) {
      const path = new URL(url, globalThis.location?.href ?? "http://127.0.0.1/").pathname;
      await send("POST", `${baseUrl}/_lab/faults`, { signal: options.signal, body: { method, path, status: 500 } });
    }
    return send(method, url, { ...init, signal: options.signal });
  }
// endregion api-request
// region api-methods
  async function listPage(params = {}, options) {
    const search = String(new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== "")));
    const result = await call("listPage", "GET", `/products${search && `?${search}`}`, options);
    result.items.forEach(remember);
    return result;
  }
  // PATCH 只发可改字段；If-Match 用最近一次从服务器看到的 version。
  const body = (product) => Object.fromEntries(editable.map((field) => [field, product[field]]));
  const ifMatch = (id) => versions.has(id) ? { "If-Match": `"${versions.get(id)}"` } : {};
  return {
    failNext(operation) { failures.add(operation); },
    listPage,
    async list(options) {
      const items = [];
      for (let page = 1; ; page++) {
        const result = await call("list", "GET", `/products?page=${page}&pageSize=50`, options);
        items.push(...result.items.map(remember));
        if (items.length >= result.total || result.items.length === 0) return items;
      }
    },
    async get(id, options) { return remember(await call("get", "GET", `/products/${id}`, options)); },
    async save(product, options) {
      return remember(await call("save", "PATCH", `/products/${product.id}`, options, { headers: ifMatch(product.id), body: body(product) }));
    },
    async create(product, options) { return remember(await call("create", "POST", "/products", options, { body: body(product) })); },
    async remove(id, options) { await call("remove", "DELETE", `/products/${id}`, options); versions.delete(id); },
    async restock(id, amount, options) {
      return remember(await call("restock", "POST", `/products/${id}/restock`, options, { body: { quantity: amount } }));
    },
    async reset() { await send("POST", `${baseUrl}/_lab/reset`); versions.clear(); failures.clear(); },
  };
}
// endregion api-methods
