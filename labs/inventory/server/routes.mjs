import { ApiError, readJsonObject, sendEmpty, sendJson } from './http.mjs';
import { createProduct, ensureSummable, listProducts, patchProduct, restockProduct } from './products.mjs';
import { parseFault } from './faults.mjs';

// If-Match 只接受 "3" 或 3；其他写法（W/"3"、*、多个值）一律当作不匹配。
function parseIfMatch(header) {
  const match = /^(?:"(\d+)"|(\d+))$/.exec(header);
  return match ? Number(match[1] ?? match[2]) : null;
}

function sendProduct(response, status, product, headers = {}) {
  sendJson(response, status, product, { ...headers, ETag: `"${product.version}"` });
}

export function createRoutes({ inventory, faults }) {
  function findOr404(id) {
    const product = inventory.find(id);
    if (!product) throw new ApiError(404, 'NOT_FOUND', `商品 ${id} 不存在`);
    return product;
  }

  function save(next, field) {
    ensureSummable(next, field);
    inventory.commit(next);
  }

  const replace = (product) => inventory.all().map((item) => (item.id === product.id ? product : item));

  async function create({ request, response }) {
    const body = await readJsonObject(request);
    const product = createProduct(inventory.all(), body);
    save([...inventory.all(), product], 'priceCents');
    sendProduct(response, 201, product, { Location: `/api/products/${product.id}` });
  }

  // 检查顺序固定：404 → 428 → 400 → 409 → 422。
  async function patch({ request, response, id }) {
    findOr404(id);
    const ifMatch = request.headers['if-match']?.trim();
    if (!ifMatch) {
      throw new ApiError(428, 'PRECONDITION_REQUIRED', '修改商品需要 If-Match 请求头，值是你读到的 version，例如 If-Match: "1"');
    }
    const body = await readJsonObject(request);
    const current = findOr404(id);
    if (parseIfMatch(ifMatch) !== current.version) {
      throw new ApiError(409, 'CONFLICT', `保存冲突：${id} 在服务器上是 version ${current.version}，你基于 ${ifMatch}`, { current });
    }
    const product = patchProduct(current, body);
    save(replace(product), Object.hasOwn(body, 'priceCents') ? 'priceCents' : 'stock');
    sendProduct(response, 200, product);
  }

  async function restock({ request, response, id }) {
    findOr404(id);
    const body = await readJsonObject(request);
    const product = restockProduct(findOr404(id), body);
    save(replace(product), 'quantity');
    sendProduct(response, 200, product);
  }

  function remove({ response, id }) {
    findOr404(id);
    inventory.commit(inventory.all().filter((item) => item.id !== id));
    sendEmpty(response, 204);
  }

  return [
    {
      path: /^\/api\/health$/,
      methods: { GET: ({ response }) => sendJson(response, 200, { ok: true }) },
    },
    {
      path: /^\/api\/products$/,
      methods: {
        GET: ({ response, url }) => sendJson(response, 200, listProducts(inventory.all(), url.searchParams)),
        POST: create,
      },
    },
    {
      path: /^\/api\/products\/([^/]+)$/,
      methods: {
        GET: ({ response, id }) => sendProduct(response, 200, findOr404(id)),
        PATCH: patch,
        DELETE: remove,
      },
    },
    {
      path: /^\/api\/products\/([^/]+)\/restock$/,
      methods: { POST: restock },
    },
    {
      path: /^\/api\/_lab\/reset$/,
      methods: {
        POST: ({ response }) => {
          inventory.reset();
          faults.clear();
          sendEmpty(response, 204);
        },
      },
    },
    {
      path: /^\/api\/_lab\/faults$/,
      methods: {
        POST: async ({ request, response }) => {
          faults.add(parseFault(await readJsonObject(request)));
          sendEmpty(response, 204);
        },
      },
    },
  ];
}
