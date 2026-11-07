export const maxBodyBytes = 64 * 1024;

// 所有可预期的失败都抛 ApiError；app.mjs 统一把它变成 {"error":{...}} 响应。
export class ApiError extends Error {
  constructor(status, code, message, { fields, current, headers } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.current = current;
    this.headers = headers;
  }

  toBody() {
    const error = { code: this.code, message: this.message };
    if (this.fields) error.fields = this.fields;
    if (this.current) error.current = this.current;
    return { error };
  }
}

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function validationError(fields, message = '字段校验失败，见 fields') {
  return new ApiError(422, 'VALIDATION', message, { fields });
}

export function sendJson(response, status, body, headers = {}) {
  const text = JSON.stringify(body);
  response.writeHead(status, {
    ...headers,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
  });
  response.end(text);
}

export function sendEmpty(response, status, headers = {}) {
  response.writeHead(status, { ...headers, 'Cache-Control': 'no-store' });
  response.end();
}

// 读完整个请求体再判断：超过 64KB 的部分直接丢弃，最后统一回 413。
export async function readJsonObject(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size <= maxBodyBytes) chunks.push(chunk);
  }
  if (size > maxBodyBytes) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', `请求体超过 64KB（收到 ${size} 字节）`);
  }
  let value;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    throw new ApiError(400, 'BAD_JSON', `请求体不是合法 JSON：${error.message}`);
  }
  if (!isPlainObject(value)) {
    throw new ApiError(400, 'BAD_JSON', '请求体必须是 JSON 对象 {…}，不能是数组、字符串、数字或 null');
  }
  return value;
}
