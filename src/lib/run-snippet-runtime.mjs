// RunSnippet 的沙箱运行时。整个函数会被 toString() 后放进沙箱 iframe 的 Worker 执行，
// 所以函数体不能引用外部变量。console 输出按 Node 的 util.inspect 规则格式化，便于与 .expected.txt 逐行对比。
export function sandboxRuntime(send, host) {
  const MAX_LINES = 500;
  const BREAK = 80;
  const KEY = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
  const ESCAPES = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '\\': '\\\\' };
  let lines = 0;
  let indent = '';
  let finished = false;
  let mainDone = false;
  const pending = new Set();

  function quote(text) {
    let mark = "'";
    if (text.includes("'")) {
      if (!text.includes('"')) mark = '"';
      else if (!text.includes('`') && !text.includes('${')) mark = '`';
    }
    // eslint-disable-next-line no-control-regex
    let body = text.replace(/[\x00-\x1f\x7f\\]/g, (c) => ESCAPES[c] ?? `\\x${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
    if (mark === "'") body = body.replaceAll("'", "\\'");
    return mark + body + mark;
  }
  function number(value) { return Object.is(value, -0) ? '-0' : String(value); }
  function constructorName(value) {
    let proto = Object.getPrototypeOf(value);
    while (proto) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'constructor');
      if (descriptor && typeof descriptor.value === 'function' && descriptor.value.name) return descriptor.value.name;
      proto = Object.getPrototypeOf(proto);
    }
    return null;
  }
  function functionBase(value, name) {
    const source = Function.prototype.toString.call(value);
    if (source.startsWith('class') && /^class\b/.test(source)) {
      const parent = Object.getPrototypeOf(value);
      return `[class ${value.name || '(anonymous)'}${parent && parent.name ? ` extends ${parent.name}` : ''}]`;
    }
    const kind = name && name !== 'Function' ? name : 'Function';
    return `[${kind}${value.name ? `: ${value.name}` : ' (anonymous)'}]`;
  }
  function belowBreak(output, start, base) {
    let total = output.length + start;
    if (total + output.length > BREAK) return false;
    for (const entry of output) {
      total += entry.length;
      if (total > BREAK) return false;
    }
    return base === '' || !base.includes('\n');
  }
  function width(text) {
    let size = 0;
    for (const char of text) {
      const code = char.codePointAt(0);
      if (code >= 0x300 && code <= 0x36f) continue;
      const wide = (code >= 0x1100 && code <= 0x115f) || (code >= 0x2e80 && code <= 0xa4cf) || (code >= 0xac00 && code <= 0xd7a3)
        || (code >= 0xf900 && code <= 0xfaff) || (code >= 0xfe30 && code <= 0xfe4f) || (code >= 0xff00 && code <= 0xff60)
        || (code >= 0xffe0 && code <= 0xffe6) || (code >= 0x1f300 && code <= 0x1f64f) || (code >= 0x1f900 && code <= 0x1f9ff)
        || (code >= 0x20000 && code <= 0x3fffd);
      size += wide ? 2 : 1;
    }
    return size;
  }
  function groupArray(ctx, all, value, more) {
    const output = more ? all.slice(0, -1) : all;
    let total = 0;
    let max = 0;
    const lengths = output.map((entry) => width(entry));
    for (const len of lengths) { total += len + 2; if (len > max) max = len; }
    const actualMax = max + 2;
    if (actualMax * 3 + ctx.indent < BREAK && (total / actualMax > 5 || max <= 6)) {
      const bias = Math.sqrt(actualMax - total / all.length);
      const biasedMax = Math.max(actualMax - 3 - bias, 1);
      const columns = Math.min(Math.round(Math.sqrt(2.5 * biasedMax * output.length) / biasedMax), Math.floor((BREAK - ctx.indent) / actualMax), 12, 15);
      if (columns <= 1) return all;
      const widths = [];
      for (let i = 0; i < columns; i++) {
        let width = 0;
        for (let j = i; j < output.length; j += columns) if (lengths[j] > width) width = lengths[j];
        widths.push(width + 2);
      }
      const numeric = value !== undefined && output.every((_, i) => typeof value[i] === 'number' || typeof value[i] === 'bigint');
      const grouped = [];
      for (let i = 0; i < output.length; i += columns) {
        const end = Math.min(i + columns, output.length);
        let line = '';
        let j = i;
        for (; j < end - 1; j++) {
          const cell = `${output[j]}, `;
          const padding = widths[j - i] + output[j].length - lengths[j];
          line += numeric ? cell.padStart(padding, ' ') : cell.padEnd(padding, ' ');
        }
        line += numeric ? output[j].padStart(widths[j - i] + output[j].length - lengths[j] - 2, ' ') : output[j];
        grouped.push(line);
      }
      if (more) grouped.push(all.at(-1));
      return grouped;
    }
    return all;
  }
  function reduce(ctx, output, base, braces, isArray, depth, value) {
    const entries = output.length;
    if (isArray && entries > 6) output = groupArray(ctx, output, value, Array.isArray(value) && value.length > 100);
    if (ctx.currentDepth - depth < 3 && entries === output.length) {
      const start = output.length + ctx.indent + braces[0].length + base.length + 10;
      if (belowBreak(output, start, base)) {
        const joined = output.join(', ');
        if (!joined.includes('\n')) return `${base ? `${base} ` : ''}${braces[0]} ${joined} ${braces[1]}`;
      }
    }
    const pad = `\n${' '.repeat(ctx.indent)}`;
    return `${base ? `${base} ` : ''}${braces[0]}${pad}  ${output.join(`,${pad}  `)}${pad}${braces[1]}`;
  }
  function property(ctx, value, key, depth, isArray) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key) ?? { value: value[key], enumerable: true };
    let text;
    if ('value' in descriptor) {
      ctx.indent += 2;
      text = format(ctx, descriptor.value, depth);
      ctx.indent -= 2;
    } else if (descriptor.get) text = descriptor.set ? '[Getter/Setter]' : '[Getter]';
    else text = descriptor.set ? '[Setter]' : 'undefined';
    if (isArray) return text;
    const name = typeof key === 'symbol' ? key.toString() : KEY.test(key) ? key : quote(key);
    return `${name}: ${text}`;
  }
  function format(ctx, value, depth) {
    if (typeof value === 'string') return quote(value);
    if (typeof value === 'number') return number(value);
    if (typeof value === 'bigint') return `${value}n`;
    if (typeof value === 'symbol') return value.toString();
    if (value === null || typeof value !== 'object' && typeof value !== 'function') return String(value);
    if (ctx.seen.includes(value)) return '[Circular *1]';
    const ctor = constructorName(value);
    const symbols = Object.getOwnPropertySymbols(value).filter((symbol) => Object.prototype.propertyIsEnumerable.call(value, symbol));
    let keys = Object.keys(value);
    let base = '';
    let braces = ['{', '}'];
    let isArray = false;
    let items = () => [];
    const prefix = (fallback, size) => ctor === null ? `[${fallback}${size}: null prototype] ` : `${ctor}${size} `;
    if (Array.isArray(value)) {
      keys = keys.filter((key) => !/^(0|[1-9]\d*)$/.test(key));
      braces = [`${ctor !== 'Array' ? prefix('Array', `(${value.length})`) : ''}[`, ']'];
      if (value.length === 0 && keys.length === 0 && symbols.length === 0) return `${braces[0]}]`;
      isArray = true;
      items = () => {
        const out = [];
        let holes = 0;
        const flush = () => { if (holes) out.push(`<${holes} empty item${holes > 1 ? 's' : ''}>`); holes = 0; };
        const shown = Math.min(value.length, 100);
        for (let i = 0; i < shown; i++) {
          if (!Object.prototype.hasOwnProperty.call(value, i)) { holes++; continue; }
          flush();
          out.push(property(ctx, value, String(i), depth, true));
        }
        flush();
        if (value.length > shown) out.push(`... ${value.length - shown} more item${value.length - shown > 1 ? 's' : ''}`);
        return out;
      };
    } else if (value instanceof Set || value instanceof Map) {
      const isMap = value instanceof Map;
      const head = prefix(isMap ? 'Map' : 'Set', `(${value.size})`);
      if (value.size === 0 && keys.length === 0 && symbols.length === 0) return `${head}{}`;
      braces = [`${head}{`, '}'];
      items = () => {
        const out = [];
        ctx.indent += 2;
        for (const entry of value) {
          out.push(isMap ? `${format(ctx, entry[0], depth)} => ${format(ctx, entry[1], depth)}` : format(ctx, entry, depth));
        }
        ctx.indent -= 2;
        return out;
      };
    } else if (typeof value === 'function') {
      base = functionBase(value, ctor);
      if (keys.length === 0 && symbols.length === 0) return base;
    } else if (value instanceof Date) {
      base = Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
      if (keys.length === 0 && symbols.length === 0) return base;
    } else if (value instanceof RegExp) {
      base = RegExp.prototype.toString.call(value);
      if (keys.length === 0 && symbols.length === 0) return base;
    } else if (value instanceof Error) {
      keys = keys.filter((key) => key !== 'stack' && key !== 'message');
      base = `${value.name}: ${value.message}`;
      if (keys.length === 0 && symbols.length === 0) return base;
    } else if (typeof WeakMap === 'function' && value instanceof WeakMap) {
      return 'WeakMap { <items unknown> }';
    } else if (typeof WeakSet === 'function' && value instanceof WeakSet) {
      return 'WeakSet { <items unknown> }';
    } else if (ctor === 'Object') {
      if (keys.length === 0 && symbols.length === 0) return '{}';
    } else {
      if (keys.length === 0 && symbols.length === 0) return `${prefix('Object', '')}{}`;
      braces = [`${prefix('Object', '')}{`, '}'];
    }
    if (depth > 2) return ctor === null ? '[Object: null prototype]' : `[${ctor}]`;
    depth += 1;
    ctx.seen.push(value);
    ctx.currentDepth = depth;
    const output = items();
    for (const key of [...keys, ...symbols]) output.push(property(ctx, value, key, depth, false));
    ctx.seen.pop();
    return reduce(ctx, output, base, braces, isArray, depth, value);
  }
  function inspect(value, depth = 2) {
    const ctx = { seen: [], indent: 0, currentDepth: 0 };
    return format(ctx, value, 2 - depth);
  }
  function builtInToString(value) {
    if (typeof value.toString !== 'function') return true;
    if (Object.prototype.hasOwnProperty.call(value, 'toString')) return false;
    let pointer = value;
    do pointer = Object.getPrototypeOf(pointer); while (pointer && !Object.prototype.hasOwnProperty.call(pointer, 'toString'));
    const owner = pointer && Object.getOwnPropertyDescriptor(pointer, 'constructor');
    return Boolean(owner) && typeof owner.value === 'function' && globalThis[owner.value.name] === owner.value;
  }
  function formatArgs(args) {
    const parts = [];
    let rest = args;
    if (typeof args[0] === 'string' && args.length > 1) {
      let index = 1;
      const template = args[0].replace(/%([sdifjoOc%])/g, (match, flag) => {
        if (flag === '%') return '%';
        if (index >= args.length) return match;
        const arg = args[index++];
        switch (flag) {
          case 's':
            if (typeof arg === 'bigint') return `${arg}n`;
            if (typeof arg === 'number') return number(arg);
            if (typeof arg === 'symbol') return arg.toString();
            if (arg !== null && typeof arg === 'object' && builtInToString(arg)) return inspect(arg, 0);
            return String(arg);
          case 'd':
            if (typeof arg === 'bigint') return `${arg}n`;
            return typeof arg === 'symbol' ? 'NaN' : number(Number(arg));
          case 'i':
            if (typeof arg === 'bigint') return `${arg}n`;
            return typeof arg === 'symbol' ? 'NaN' : number(Number.parseInt(arg, 10));
          case 'f': return typeof arg === 'symbol' ? 'NaN' : number(Number.parseFloat(arg));
          case 'j': try { return JSON.stringify(arg); } catch { return '[Circular]'; }
          case 'c': return '';
          default: return inspect(arg, 4);
        }
      });
      parts.push(template);
      rest = args.slice(index);
    } else if (typeof args[0] === 'string') {
      parts.push(args[0]);
      rest = args.slice(1);
    }
    for (const arg of rest) parts.push(typeof arg === 'string' ? arg : inspect(arg));
    return parts.join(' ');
  }

  function emit(level, text) {
    if (finished) return;
    if (lines >= MAX_LINES) {
      if (lines === MAX_LINES) send({ type: 'truncated', limit: MAX_LINES });
      lines++;
      return;
    }
    lines++;
    send({ type: 'log', level, text: indent ? text.split('\n').map((line) => indent + line).join('\n') : text });
  }
  function finish() {
    if (finished) return;
    finished = true;
    for (const id of pending) host.clearTimeout(id);
    pending.clear();
    send({ type: 'done' });
  }
  function fail(error) {
    const text = error instanceof Error ? `${error.name}: ${error.message}` : inspect(error);
    emit('error', `Uncaught ${text}`);
    finish();
  }
  function settle() {
    if (!mainDone || finished || pending.size) return;
    host.setTimeout(() => { if (mainDone && !finished && !pending.size) finish(); }, 0);
  }
  const out = (...args) => emit('log', formatArgs(args));
  const err = (level) => (...args) => emit(level, formatArgs(args));
  const sandboxConsole = {
    log: out, info: out, debug: out,
    warn: err('warn'), error: err('error'), trace: err('error'),
    dir: (value) => emit('log', inspect(value)),
    table: out,
    assert: (condition, ...args) => { if (!condition) emit('error', args.length ? `Assertion failed: ${formatArgs(args)}` : 'Assertion failed'); },
    group: (...args) => { if (args.length) out(...args); indent += '  '; },
    groupCollapsed: (...args) => { if (args.length) out(...args); indent += '  '; },
    groupEnd: () => { indent = indent.slice(2); },
  };
  const timers = {
    setTimeout(callback, delay, ...args) {
      const id = host.setTimeout(() => {
        pending.delete(id);
        if (finished) return;
        try { if (typeof callback === 'function') callback(...args); } catch (error) { fail(error); return; }
        settle();
      }, delay);
      pending.add(id);
      return id;
    },
    clearTimeout(id) { pending.delete(id); host.clearTimeout(id); settle(); },
    setInterval(callback, delay, ...args) {
      const id = host.setInterval(() => {
        if (finished) return;
        try { if (typeof callback === 'function') callback(...args); } catch (error) { host.clearInterval(id); pending.delete(id); fail(error); }
      }, delay);
      pending.add(id);
      return id;
    },
    clearInterval(id) { pending.delete(id); host.clearInterval(id); settle(); },
  };

  return {
    fail,
    async run(code) {
      const AsyncFunction = (async () => {}).constructor;
      let body;
      try {
        body = new AsyncFunction('console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', `"use strict";\n${code}`);
      } catch (error) { fail(error); return; }
      try {
        await body(sandboxConsole, timers.setTimeout, timers.clearTimeout, timers.setInterval, timers.clearInterval);
      } catch (error) { fail(error); return; }
      mainDone = true;
      settle();
    },
  };
}
