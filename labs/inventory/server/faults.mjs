import { isPlainObject, validationError } from './http.mjs';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
const isIntegerIn = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

export function parseFault(body) {
  const { method, path, status, delayMs, times = 1, body: responseBody } = body;
  const fields = {};
  if (!methods.includes(method)) fields.method = 'method 必须是大写的 HTTP 方法，例如 GET';
  if (typeof path !== 'string' || !path.startsWith('/api/') || path.includes('?')) {
    fields.path = 'path 必须是 /api/ 开头的路径，不含查询串';
  } else if (path.startsWith('/api/_lab/')) {
    fields.path = '/api/_lab/ 下的接口不受故障影响';
  }
  if (status !== undefined && !isIntegerIn(status, 400, 599)) fields.status = 'status 必须是 400–599 的整数';
  if (delayMs !== undefined && !isIntegerIn(delayMs, 0, 10000)) fields.delayMs = 'delayMs 必须是 0–10000 的整数';
  if (status === undefined && delayMs === undefined) {
    fields.status = fields.delayMs = 'status 与 delayMs 至少提供一个';
  }
  if (!isIntegerIn(times, 1, 20)) fields.times = 'times 必须是 1–20 的整数';
  if (responseBody !== undefined && !isPlainObject(responseBody)) fields.body = 'body 必须是 JSON 对象';
  if (Object.keys(fields).length) throw validationError(fields, '故障参数不合法，见 fields');
  return { method, path, status, delayMs, remaining: times, body: responseBody };
}

// 按注入顺序消耗：同一方法和路径有多条故障时，先注入的先生效。
export function createFaultQueue() {
  let queue = [];
  return {
    add(fault) {
      queue.push(fault);
    },
    take(method, path) {
      const fault = queue.find((item) => item.method === method && item.path === path);
      if (!fault) return null;
      fault.remaining -= 1;
      if (fault.remaining === 0) queue = queue.filter((item) => item !== fault);
      return fault;
    },
    clear() {
      queue = [];
    },
  };
}
