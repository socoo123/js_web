import { constants, copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { validateProduct } from './rules.generated.mjs';

export class DataFileError extends Error {
  constructor(file, reason) {
    super(`数据文件损坏：${displayPath(file)}（${reason}）。运行 npm run lab -- api reset 恢复固定数据；损坏文件会另存，不会删除。`);
    this.name = 'DataFileError';
    this.file = file;
    this.reason = reason;
  }
}

export function displayPath(file) {
  const relative = path.relative(process.cwd(), file);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative) ? relative : file;
}

export function toRecord(product, version) {
  return {
    id: product.id,
    name: product.name.trim(),
    category: product.category,
    stock: product.stock,
    priceCents: product.priceCents,
    tags: [...product.tags],
    version,
  };
}

function checkProducts(list, { withVersion }) {
  if (!Array.isArray(list)) throw new Error('products 必须是数组');
  const ids = new Set();
  return list.map((item, index) => {
    const label = `第 ${index + 1} 个商品${typeof item?.id === 'string' ? `（${item.id}）` : ''}`;
    const errors = validateProduct(item);
    if (!Object.keys(errors).length && withVersion && !(Number.isSafeInteger(item.version) && item.version > 0)) {
      errors.version = 'version 必须是正整数';
    }
    if (Object.keys(errors).length) throw new Error(`${label}：${Object.values(errors).join('；')}`);
    if (ids.has(item.id)) throw new Error(`重复编号 ${item.id}`);
    ids.add(item.id);
    return toRecord(item, withVersion ? item.version : 1);
  });
}

function parseDataFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`不是合法 JSON：${error.message}`);
  }
  if (data === null || typeof data !== 'object' || data.format !== 1) throw new Error('缺少 "format": 1');
  return checkProducts(data.products, { withVersion: true });
}

function readSeed(seedFile) {
  try {
    return checkProducts(JSON.parse(readFileSync(seedFile, 'utf8')), { withVersion: false });
  } catch (error) {
    throw new Error(`固定数据无法使用：${displayPath(seedFile)}（${error.message}）`, { cause: error });
  }
}

function loadDataFile(dataFile, seedFile) {
  if (!existsSync(dataFile)) {
    const products = readSeed(seedFile);
    writeDataFile(dataFile, products);
    return products;
  }
  const text = readFileSync(dataFile, 'utf8');
  try {
    return parseDataFile(text);
  } catch (error) {
    throw new DataFileError(dataFile, error.message);
  }
}

// 先写同目录的临时文件再 rename：同一文件系统内 rename 是原子的，中途失败时旧文件保持完整。
export function writeDataFile(dataFile, products) {
  const temp = `${dataFile}.tmp`;
  mkdirSync(path.dirname(dataFile), { recursive: true });
  try {
    writeFileSync(temp, JSON.stringify({ format: 1, products }, null, 2) + '\n', { flush: true });
    renameSync(temp, dataFile);
  } catch (error) {
    try { unlinkSync(temp); } catch { /* 临时文件可能根本没有写出来 */ }
    throw error;
  }
}

function isDamaged(dataFile) {
  if (!existsSync(dataFile)) return false;
  try {
    parseDataFile(readFileSync(dataFile, 'utf8'));
    return false;
  } catch {
    return true;
  }
}

export function resetDataFile(dataFile, seedFile) {
  const products = readSeed(seedFile);
  let damagedFile = null;
  if (isDamaged(dataFile)) {
    damagedFile = `${dataFile}.damaged-${new Date().toISOString().replaceAll(':', '')}`;
    copyFileSync(dataFile, damagedFile, constants.COPYFILE_EXCL);
  }
  writeDataFile(dataFile, products);
  return { products, damagedFile };
}

// 内存里保存当前数据；只有写盘成功才替换内存，所以写盘失败等于自动回滚。
export function openInventory(dataFile, seedFile) {
  let products = loadDataFile(dataFile, seedFile);
  return {
    all: () => products,
    find: (id) => products.find((product) => product.id === id),
    commit(next) {
      try {
        writeDataFile(dataFile, next);
      } catch (error) {
        throw new Error(`写入 ${displayPath(dataFile)} 失败，本次修改未生效：${error.message}`, { cause: error });
      }
      products = next;
    },
    reset() {
      products = resetDataFile(dataFile, seedFile).products;
    },
  };
}
