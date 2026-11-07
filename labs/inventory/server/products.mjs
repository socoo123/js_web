import { categories, selectProducts, summarize, validateProduct } from './rules.generated.mjs';
import { ApiError, validationError } from './http.mjs';
import { toRecord } from './store.mjs';

const maxStock = 99999;
const editableFields = ['name', 'category', 'stock', 'priceCents', 'tags'];
const lockedFieldMessages = {
  id: '编号不能修改',
  version: 'version 由服务器维护；用 If-Match 请求头说明你基于哪个版本',
};

const compareIds = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const sorts = {
  id: compareIds,
  name: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN') || compareIds(a, b),
  stock: (a, b) => a.stock - b.stock || compareIds(a, b),
  '-stock': (a, b) => b.stock - a.stock || compareIds(a, b),
};
const stockFilters = {
  all: () => true,
  low: (product) => product.stock >= 1 && product.stock <= 5,
  out: (product) => product.stock === 0,
};

function positiveInteger(text, max) {
  if (!/^[1-9]\d*$/.test(text)) return undefined;
  const value = Number(text);
  return value <= max ? value : undefined;
}

// 每个查询参数：不传时用 fallback；传了但 parse 返回 undefined 就是非法取值。
const queryRules = {
  category: {
    fallback: '全部',
    parse: (text) => (text === '全部' || categories.includes(text) ? text : undefined),
    message: `category 只能是 全部、${categories.join('、')}`,
  },
  stock: {
    fallback: 'all',
    parse: (text) => (text === 'low' || text === 'out' ? text : undefined),
    message: 'stock 只能是 low（1–5 件）或 out（0 件）',
  },
  sort: {
    fallback: 'id',
    parse: (text) => (Object.hasOwn(sorts, text) ? text : undefined),
    message: 'sort 只能是 id、name、stock 或 -stock',
  },
  page: { fallback: 1, parse: (text) => positiveInteger(text, Number.MAX_SAFE_INTEGER), message: 'page 必须是正整数' },
  pageSize: { fallback: 20, parse: (text) => positiveInteger(text, 50), message: 'pageSize 必须是 1–50 的整数' },
};

function parseListQuery(params) {
  const query = { q: params.get('q') ?? '' };
  const fields = {};
  for (const [name, rule] of Object.entries(queryRules)) {
    const text = params.get(name);
    query[name] = text === null ? rule.fallback : rule.parse(text);
    if (query[name] === undefined) fields[name] = rule.message;
  }
  if (Object.keys(fields).length) throw new ApiError(400, 'BAD_QUERY', '查询参数不合法，见 fields', { fields });
  return query;
}

export function listProducts(products, params) {
  const query = parseListQuery(params);
  const matched = selectProducts(products, { query: query.q, category: query.category })
    .filter(stockFilters[query.stock])
    .sort(sorts[query.sort]);
  const start = (query.page - 1) * query.pageSize;
  return {
    items: matched.slice(start, start + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total: matched.length,
    summary: summarize(matched),
    totals: summarize(products),
  };
}

function pickEditable(body) {
  const picked = {};
  for (const field of editableFields) if (Object.hasOwn(body, field)) picked[field] = body[field];
  if (typeof picked.name === 'string') picked.name = picked.name.trim();
  return picked;
}

function nextId(products) {
  const largest = Math.max(0, ...products.map((product) => Number(product.id.slice(1))));
  return largest < 999 ? `P${String(largest + 1).padStart(3, '0')}` : null;
}

export function createProduct(products, body) {
  const id = nextId(products);
  const draft = { id: id ?? 'P999', ...pickEditable(body) };
  const fields = validateProduct(draft);
  if (!id) fields.id = '编号已用尽：最大编号是 P999';
  if (Object.keys(fields).length) throw validationError(fields);
  return toRecord(draft, 1);
}

export function patchProduct(current, body) {
  const fields = {};
  for (const key of Object.keys(body)) {
    if (!editableFields.includes(key)) fields[key] = lockedFieldMessages[key] ?? `不能修改：只允许 ${editableFields.join('、')}`;
  }
  const next = { ...current, ...pickEditable(body) };
  Object.assign(fields, validateProduct(next));
  if (Object.keys(fields).length) throw validationError(fields);
  return toRecord(next, current.version + 1);
}

export function restockProduct(current, body) {
  const { quantity } = body;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxStock) {
    throw validationError({ quantity: '补货数量必须是 1–99999 的整数' });
  }
  if (current.stock + quantity > maxStock) {
    throw validationError({ quantity: `补货后库存不能超过 99999（当前 ${current.stock}）` });
  }
  return { ...current, stock: current.stock + quantity, version: current.version + 1 };
}

// 单个商品合法时，总价值仍可能超过安全整数；在写入前拦下，否则之后每次列表请求都会失败。
export function ensureSummable(products, field) {
  try {
    summarize(products);
  } catch (error) {
    if (error instanceof RangeError) throw validationError({ [field]: error.message });
    throw error;
  }
}
